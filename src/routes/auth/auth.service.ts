import { HashingService } from 'src/routes/shared/services/hashing.service'
import { RolesService } from './roles.service'
import { generateOTP, isUniqueConstraintPrismaError } from 'src/routes/shared/helpers'
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator'
import { LoginBodyType, RefreshTokenBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { ShareUserRepository } from '../shared/repositories/shared-user.repo'
import { HttpException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import envConfig from '../shared/config'
import { TypeOfVerificationCode } from '../shared/constants/auth.constant'
import { EmailService } from '../shared/services/email.service'
import { TokenService } from '../shared/services/token.service'
import { AccessTokenPayloadCreate } from '../shared/types/jwt.type'
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly emailService: EmailService,
    private readonly tokenService: TokenService,
  ) {}
  async register(body: RegisterBodyType) {
    try {
      const verificationCode = await this.authRepository.findVerificationCode({ 
        email: body.email, 
        type: TypeOfVerificationCode.REGISTER, 
        code: body.code 
      })
      if(!verificationCode){
        throw new UnprocessableEntityException([{
          path: 'code',
          message: 'Ma OTP khong hop le',
        }])
      }
      if(verificationCode.expiresAt < new Date()){
        throw new UnprocessableEntityException([{
          path: 'code',
          message: 'OTP has expired',
        }])
      }

      const hashedPassword = await this.hashingService.hash(body.password)
      const roleId = await this.roleService.getClientRoleId()
      const user = await this.authRepository.createUser({
        email: body.email,
        phoneNumber: body.phoneNumber,
        name: body.name,
        password: hashedPassword,
        roleId,
      })
      return user
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new UnprocessableEntityException({
          path: 'email',
          message: 'Email already exists',
        })
      }
      throw error
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    // Implementation for sending OTP
    const user = await this.shareUserRepository.findUnique({ email: body.email })
    if(user) {
      // Logic to send OTP to existing user
      throw new UnprocessableEntityException([{
          path: 'email',
          message: 'Email already exists',
      }])
    } 

    const code = generateOTP()
    const verificationCode = await this.authRepository.createVerificationCode({
      email: body.email,
      code,
      type: body.type,
      expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN as ms.StringValue)), // 15 minutes from now
    })

    const {error} = await this.emailService.sendOTP({ email: body.email, code })
    console.log(error);
    if(error){
      throw new UnprocessableEntityException([{
        message: 'Failed to send OTP email',
        path: 'code'
      }])
    }

    return verificationCode
  }

  async login(body: LoginBodyType & { userAgent: string, ip: string }) {
    const user = await this.authRepository.findUniqueIncludeRole({ email: body.email })
    if(!user) {
      throw new UnprocessableEntityException([{
        path: 'email',
        message: 'Email does not exist',
      }])
    }
    const isPasswordValid = await this.hashingService.compare(body.password, user.password)
    if(!isPasswordValid) {
      throw new UnprocessableEntityException([{
        path: 'password',
        message: 'Password is incorrect',
      }])
    }
    const device =  await this.authRepository.createDevice({
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
    const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);
    await this.authRepository.createRefreshToken({
      token: refreshToken,
      userId: userId,
      expiresAt: new Date(decodedRefreshToken.exp * 1000),
      deviceId: deviceId,
    })
    return { accessToken, refreshToken }
  }

  async refreshToken ({refreshToken, userAgent, ip}: RefreshTokenBodyType & { userAgent: string, ip: string}) {
    try {
      // 1.kiem tra token co hop le khong
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)
      // 2.kiem tra token co ton tai trong db khong
      const refreshTokenInDB = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({token: refreshToken})
      if(!refreshTokenInDB){
        throw new UnauthorizedException('Refresh token khong ton tai trong db')
      }
      const { deviceId, user: { roleId, role:{ name } } } = refreshTokenInDB
      // 3.cap nhat device
      const $updateDevice = this.authRepository.updateDevice(deviceId, {ip, userAgent})
      // 4.xoa refresh token cu
      const $deleteRefreshToken = this.authRepository.deleteRefreshToken({token: refreshToken})
      // 5.tao token moi
      const $tokens = this.generateTokens({userId,deviceId, roleId, roleName: name})
      const [, , tokens ] =  await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])
      return tokens 
    } catch (error) {
      console.log(error);
      if (error instanceof HttpException){
        throw error
      }
      throw new UnauthorizedException()
    }
  }
}
