import { Injectable } from "@nestjs/common";
import { PrismaService } from "../shared/services/prisma.service";
import { RegisterBodyType } from "./auth.model";
import { UserType } from "../shared/models/shared-user.model";
import { VerificationCodeType } from "./auth.model";
import { TypeOfVerificationCodeType } from "../shared/constants/auth.constant";

@Injectable()
export class AuthRepository {
    constructor(
        private readonly prismaService: PrismaService,
    ) {}
    async createUser(user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>): Promise< Omit<UserType, 'password' | 'totpSecret'>> {
        return await this.prismaService.user.create({
            data: user,
            omit: {
                password: true,
                totpSecret: true,
            },
        });
    }

    async createVerificationCode(payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>): Promise<VerificationCodeType> {
        return await this.prismaService.verificationCode.upsert({
            where: { email: payload.email },
            update: {
                code: payload.code,
                expiresAt: payload.expiresAt,
            },
            create: payload,
        });
    }

    async findVerificationCode(uniqueValue: { email: string }|{id: number}| {email: string, type: TypeOfVerificationCodeType, code: string}): Promise<VerificationCodeType | null> {
        return await this.prismaService.verificationCode.findUnique({
            where: uniqueValue,
        });
    }
}