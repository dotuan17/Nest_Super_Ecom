import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterBodyDTO, RegisterResDTO, SendOTPBodyDTO } from "./auth.dto";
import { ZodSerializerDto } from "nestjs-zod";
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    @Post('register')
    @ZodSerializerDto(RegisterResDTO)
    async register(@Body() body: RegisterBodyDTO) {
        return await this.authService.register(body);
    }
    @Post('send-otp')
    async sendOTP(@Body() body: SendOTPBodyDTO) {
        return await this.authService.sendOTP(body);
    }
}