import { HashingService } from 'src/routes/shared/services/hashing.service'
import { RolesService } from './roles.service'
import { generateOTP, isUniqueConstraintPrismaError } from 'src/routes/shared/helpers'
import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator'
import { RegisterBodyType, SendOTPBodyType } from './auth.model'
import { AuthRepository } from './auth.repo'
import { ShareUserRepository } from '../shared/repositories/shared-user.repo'
import { UnprocessableEntityException } from '@nestjs/common'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import envConfig from '../shared/config'
import { TypeOfVerificationCode } from '../shared/constants/auth.constant'
import { EmailService } from '../shared/services/email.service'
import path from 'path'

@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly roleService: RolesService,
    private readonly authRepository: AuthRepository,
    private readonly shareUserRepository: ShareUserRepository,
    private readonly emailService: EmailService,
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
    if(error){
      throw new UnprocessableEntityException([{
        message: 'Failed to send OTP email',
        path: 'code'
      }])
    }

    return verificationCode
  }
}
