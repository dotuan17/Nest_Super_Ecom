import { Body, Controller, Get, HttpCode, HttpStatus, Ip, Post } from '@nestjs/common'
import { AuthService } from './auth.service'
import {
  Disable2FABodyDTO,
  ForgotPasswordBodyDTO,
  LoginBodyDTO,
  LoginResDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
  TwoFactorSetupResDTO,
} from './auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
import { UserAgent } from '../shared/decorators/user-agent.decorator'
import { MessageResDTO } from '../shared/dtos/response.dto'
import { IsPublic } from '../shared/decorators/auth.decorator'
import { EmptyBodyDTO } from '../shared/dtos/request.dto'
import { ActiveUser } from '../shared/decorators/active-user.decorator'
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  @Post('send-otp')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOTP(body)
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @IsPublic()
  @ZodSerializerDto(LoginResDTO)
  async login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.login({
      ...body,
      userAgent,
      ip,
    })
  }

  @Post('refresh-token')
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDTO)
  async refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.refreshToken({
      refreshToken: body.refreshToken,
      userAgent,
      ip,
    })
  }

  @Post('logout')
  @ZodSerializerDto(MessageResDTO)
  async logout(@Body() body: LogoutBodyDTO) {
    return await this.authService.logout(body.refreshToken)
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return await this.authService.forgotPassword(body)
  }

  @Post('2fa/setup')
  @ZodSerializerDto(TwoFactorSetupResDTO)
  async setup2FA(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.authService.setup2FA(userId)
  }

  @Post('2fa/disable')
  @ZodSerializerDto(MessageResDTO)
  async disable2FA(@Body() body: Disable2FABodyDTO, @ActiveUser('userId') userId: number) {
    return await this.authService.disable2FA({ ...body, userId })
  }
}
