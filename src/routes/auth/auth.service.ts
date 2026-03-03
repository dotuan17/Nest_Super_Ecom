import { HashingService } from 'src/routes/shared/services/hashing.service'
import { RolesService } from './roles.service'
import { generateOTP, isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/routes/shared/helpers'
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator'
import {
  ForgotPasswordBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  RegisterBodyType,
  SendOTPBodyType,
} from './auth.model'
import { AuthRepository } from './auth.repo'
import { ShareUserRepository } from '../shared/repositories/shared-user.repo'
import { HttpException, Type, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import envConfig from '../shared/config'
import { TypeOfVerificationCode, TypeOfVerificationCodeType } from '../shared/constants/auth.constant'
import { EmailService } from '../shared/services/email.service'
import { TokenService } from '../shared/services/token.service'
import { AccessTokenPayloadCreate } from '../shared/types/jwt.type'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToSendOTPException,
  InvalidOTPException,
  InvalidPasswordException,
  OTPExpiredException,
  TOTPAlreadyEnabledException,
} from './error.model'
import { TwoFactorAuthService } from '../shared/services/2fa.service'
import { email } from 'zod'
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
    private readonly twoFactorAuthService: TwoFactorAuthService,
  ) {}

  async validateVerificationCode({
    email,
    code,
    type,
  }: {
    email: string
    code: string
    type: TypeOfVerificationCodeType
  }) {
    const verificationCode = await this.authRepository.findUniqueVerificationCode({
      email_code_type: {
        email,
        code,
        type,
      },
    })
    if (!verificationCode) {
      throw InvalidOTPException
    }
    if (verificationCode.expiresAt < new Date()) {
      throw OTPExpiredException
    }
    return verificationCode
  }

  async register(body: RegisterBodyType) {
    try {
      // Kiem tra OTP co hop le khong
      await this.validateVerificationCode({ email: body.email, code: body.code, type: TypeOfVerificationCode.REGISTER })

      const hashedPassword = await this.hashingService.hash(body.password)
      const roleId = await this.roleService.getClientRoleId()
      // Tao user moi va xoa OTP da su dung
      const [user] = await Promise.all([
        this.authRepository.createUser({
          email: body.email,
          phoneNumber: body.phoneNumber,
          name: body.name,
          password: hashedPassword,
          roleId,
        }),
        this.authRepository.deleteVerificationCode({ email_code_type:{
          email: body.email,
          code: body.code,
          type: TypeOfVerificationCode.REGISTER,
        }}),
      ])
      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw EmailAlreadyExistsException
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // Implementation for sending OTP
    const user = await this.shareUserRepository.findUnique({ email: body.email })
    if (user && body.type === TypeOfVerificationCode.REGISTER) {
      // Logic to send OTP to existing user
      throw EmailAlreadyExistsException
    }

    if (!user && body.type === TypeOfVerificationCode.FORGOT_PASSWORD) {
      throw EmailNotFoundException
    }

    const code = generateOTP()
    const vfCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as ms.StringValue)), // 15 minutes from now
    })

    const { error } = await this.emailService.sendOTP({ email: body.email, code })
    console.log(error)
    if (error) {
      throw FailedToSendOTPException
    }

    return { message: 'OTP sent successfully' }
  }

  async login(body: LoginBodyType & { userAgent: string; ip: string }) {
    const user = await this.authRepository.findUniqueIncludeRole({ email: body.email })
    if (!user) {
      throw EmailNotFoundException
    }
    const isPasswordValid = await this.hashingService.compare(body.password, user.password)
    if (!isPasswordValid) {
      throw InvalidPasswordException
    }
    const device = await this.authRepository.createDevice({
      userId: user.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })
    const tokens = await this.generateTokens({
      userId: user.id,
      deviceId: device.id,
      roleId: user.roleId,
      roleName: user.role.name,
    })
    return tokens
  }

  async generateTokens({ userId, deviceId, roleId, roleName }: AccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId,
        deviceId,
        roleId,
        roleName,
      }),
      this.tokenService.signRefreshToken({ userId }),
    ])
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId: deviceId,
    })
    return { accessToken, refreshToken }
  }

  async refreshToken({ refreshToken, userAgent, ip }: RefreshTokenBodyType & { userAgent: string; ip: string }) {
    try {
      // 1.kiem tra token co hop le khong
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      // 2.kiem tra token co ton tai trong db khong
      const refreshTokenInDB = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({ token: refreshToken })
      if (!refreshTokenInDB) {
        throw new UnauthorizedException('Refresh token da duoc su dung')
      }
      const {
        deviceId,
        user: {
          roleId,
          role: { name },
        },
      } = refreshTokenInDB
      // 3.cap nhat device
      const $updateDevice = this.authRepository.updateDevice(deviceId, { ip, userAgent })
      // 4.xoa refresh token cu
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({ token: refreshToken })
      // 5.tao token moi
      const $tokens = this.generateTokens({ userId, deviceId, roleId, roleName: name })
      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])
      return tokens
    } catch (error) {
      console.log(error)
      if (error instanceof HttpException) {
        throw error
      }
      throw new UnauthorizedException()
    }
  }

  async logout(refreshToken: string) {
    try {
      // kiem tra token co hop le hay khong
      await this.tokenService.verifyRefreshToken(refreshToken)
      // xoa refreshtoken trong db
      const { deviceId } = await this.authRepository.deleteRefreshToken({ token: refreshToken })
      // cap nhat device la da logout
      await this.authRepository.updateDevice(deviceId, { isActive: false })
      return { message: 'Dang xuat thanh cong' }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw new UnauthorizedException('Refresh token da duoc su dung')
      }
      throw new UnauthorizedException()
    }
  }

  async forgotPassword(body: ForgotPasswordBodyType) {
    const { email, code, newPassword } = body
    // Kiem tra email co ton tai khong
    const user = await this.shareUserRepository.findUnique({ email })
    if (!user) {
      throw EmailNotFoundException
    }
    // Kiem tra OTP co hop le khong
    await this.validateVerificationCode({ email, code, type: TypeOfVerificationCode.FORGOT_PASSWORD })
    const hashedPassword = await this.hashingService.hash(newPassword)

    // Cap nhat password moi cva xoa OTP da su dung
    await Promise.all([
      this.authRepository.updateUser({ email }, { password: hashedPassword }),
      this.authRepository.deleteVerificationCode({ email_code_type: { email, code, type: TypeOfVerificationCode.FORGOT_PASSWORD } }),
    ])
    return { message: 'Password updated successfully' }
  }

  async setup2FA(userId: number) {
    // Lay thong tin user kiem tra user co ton tai hay khong, va xem ho da bat 2FA chua
    const user = await this.shareUserRepository.findUnique({ id: userId })
    if (!user) {
      throw EmailNotFoundException
    }
    if (user.totpSecret) {
      throw TOTPAlreadyEnabledException
    }
    // Tao secret va uri
    const { secret, uri } = this.twoFactorAuthService.generateTOTPSecret(user.email)
    // Cap nhat secret vao user trong db
    await this.authRepository.updateUser({ id: userId }, { totpSecret: secret })
    // Tra ve secret va uri cho client de tao QR code
    return { secret, uri }
  }
}
  