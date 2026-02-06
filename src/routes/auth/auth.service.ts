import { HashingService } from "src/routes/shared/services/hashing.service";
import { PrismaService } from "src/routes/shared/services/prisma.service";
import { RolesService } from "./roles.service";
import { TokenService } from "src/routes/shared/services/token.service";
import { ConflictException } from "@nestjs/common/exceptions/conflict.exception";
import { isUniqueConstraintPrismaError } from "src/routes/shared/helpers";
import { Injectable } from "@nestjs/common/decorators/core/injectable.decorator";
import { RegisterBodyType } from "./auth.model";
import { AuthRepository } from "./auth.repo";

@Injectable()
export class AuthService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly roleService: RolesService,
        private readonly authRepository: AuthRepository,
    ) {}
    async register(body: RegisterBodyType) {
    try {
      const hashedPassword = await this.hashingService.hash(body.password)
      const roleId = await this.roleService.getClientRoleId();
      const user = await this.authRepository.createUser({
        email: body.email,
        phoneNumber: body.phoneNumber,
        name: body.name,
        password: hashedPassword,
        roleId,
      });
      return user;
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw new ConflictException('Email already exists')
      }
      throw error
    }
  }
}