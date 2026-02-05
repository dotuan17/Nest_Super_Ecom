import { HashingService } from "src/shared/services/hashing.service";
import { PrismaService } from "src/shared/services/prisma.service";
import { RolesService } from "./roles.service";
import { TokenService } from "src/shared/services/token.service";
import { ConflictException } from "@nestjs/common/exceptions/conflict.exception";
import { isUniqueConstraintPrismaError } from "src/shared/helpers";
import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { RegisterBodyDTO } from "./auth.dto";

@Injectable()
export class AuthService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly prismaService: PrismaService,
        private readonly tokenService: TokenService,
        private readonly roleService: RolesService,
    ) {}
    async register(body: RegisterBodyDTO) {
    try {
      const hashedPassword = await this.hashingService.hash(body.password)
      const roleId = await this.roleService.getClientRoleId();
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          phoneNumber: body.phoneNumber,
          name: body.name,
          roleId: roleId,
          password: hashedPassword,
        },
        omit:{
          password: true,
          totpSecret: true,
        }
      })
      return user;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email already exists')
      }
      throw error
    }
  }
}