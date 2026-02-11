import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import envConfig from "../config";
import e from "express";

@Injectable()
export class EmailService {
    private resend: Resend;

    constructor() {
        this.resend = new Resend(envConfig.RESEND_API_KEY || '');
    }

    async sendOTP(payload: { email: string, code: string }){
        return await this.resend.emails.send({
            from: 'Ecom Nest DVT <tuandosendemail@resend.dev>',
            to: [payload.email],
            subject: 'Your OTP Code',
            html: `<strong>Your OTP code is: ${payload.code}</strong>`,
        });
    }
}