import { Injectable } from "@nestjs/common";
import * as OTPAuth from "otpauth";
import envConfig from "../config";

@Injectable()
export class TwoFactorAuthService {
    private createTOTP(email: string, secret?: string) {
        return new OTPAuth.TOTP({
            issuer: envConfig.APP_NAME,
            label: email,
            algorithm: 'SHA1',
            digits: 6,
            period: 30, // 30s
            secret: secret || new OTPAuth.Secret().base32, // Generate new secret if not provided
        });
    }

    generateTOTPSecret(email: string) {
        const totp = this.createTOTP(email);
        return {
            secret: totp.secret.base32,
            uri: totp.toString(),
        }
    }

    verifyTOTP({ token, email, secret }: { token: string, email: string, secret: string }): boolean {
        const totp = this.createTOTP(email, secret);
        const delta = totp.validate({ token, window: 1})
        return delta !== null
    }
}

const twoFactorAuthService = new TwoFactorAuthService();
console.log(twoFactorAuthService.verifyTOTP({
    email:'dovantuan17012001@gmail.com',
    token:'832581',
    secret: '6OIBTBBH6UFYB7XEQE5VGR3IOBWRDKQO'
}));