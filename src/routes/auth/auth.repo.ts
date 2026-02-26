import { Injectable } from '@nestjs/common'
import { PrismaService } from '../shared/services/prisma.service'
import { DeviceType, RefreshTokenType, RegisterBodyType, RoleType } from './auth.model'
import { UserType } from '../shared/models/shared-user.model'
import { VerificationCodeType } from './auth.model'
import { TypeOfVerificationCodeType } from '../shared/constants/auth.constant'
@Injectable()
export class AuthRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }

  async createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: { email: payload.email },
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
        type: payload.type,
      },
      create: payload,
    })
  }

  async findUniqueVerificationCode(
    uniqueValue: { email: string } | { id: number } | { email: string; type: TypeOfVerificationCodeType; code: string },
  ): Promise<VerificationCodeType | null> {
    return await this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    })
  }

  async createRefreshToken(data: { token: string; userId: number; expiresAt: Date; deviceId: number }) {
    return await this.prismaService.refreshToken.create({
      data,
    })
  }

  async createDevice(
    data: Pick<DeviceType, 'userId' | 'userAgent' | 'ip'> & Partial<Pick<DeviceType, 'isActive' | 'lastActive'>>,
  ) {
    return await this.prismaService.device.create({
      data,
    })
  }

  async findUniqueIncludeRole(
    uniqueValue: { email: string } | { id: number },
  ): Promise<(UserType & { role: RoleType }) | null> {
    return await this.prismaService.user.findUnique({
      where: uniqueValue,
      include: {
        role: true,
      },
    })
  }

  async findUniqueRefreshTokenIncludeUserRole(uniqueValue: {
    token: string
  }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null> {
    return await this.prismaService.refreshToken.findUnique({
      where: uniqueValue,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    })
  }

  async updateDevice(deviceId: number, data: Partial<DeviceType>): Promise<DeviceType> {
    return await this.prismaService.device.update({
      where: {
        id: deviceId,
      },
      data,
    })
  }

  async deleteRefreshToken(uniqueValue: { token: string }): Promise<RefreshTokenType> {
    return await this.prismaService.refreshToken.delete({
      where: uniqueValue,
    })
  }

  async updateUser(
    uniqueValue: { id: number } | { email: string },
    data: Partial<UserType>,
  ): Promise<Omit<UserType, 'id'>> {
    return await this.prismaService.user.update({
      where: uniqueValue,
      data,
    })
  }

  async deleteVerificationCode(
    uniqueValue: { id: number } | { email: string } | { email: string; type: TypeOfVerificationCodeType; code: string },
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.delete({
      where: uniqueValue,
    })
  }
}
