import { Module, Global } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from './guards/access-token.guard'
import { APIKeyGuard } from './guards/api-key.guard'
import { APP_GUARD } from '@nestjs/core'
import { AuthenticationGuard } from './guards/authentication.guard'

const sharedServices = [PrismaService, HashingService, TokenService, AccessTokenGuard, APIKeyGuard]
@Global()
@Module({
  providers: [
    ...sharedServices,
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard
    }
  ],
  exports: [...sharedServices],
  imports: [JwtModule],
})
export class SharedModule {}
