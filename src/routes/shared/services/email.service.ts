import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import path from 'path'
import fs from 'fs'

@Injectable()
export class EmailService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY || '')
  }

  async sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP của bạn'
    const otpTemplate = fs.readFileSync(path.resolve('src/routes/shared/email-templates/otp.html'), {
      encoding: 'utf-8',
    })
    return await this.resend.emails.send({
      from: 'Ecommerce Nest DVT <tuandosendemail@resend.dev>',
      to: [payload.email],
      subject: subject,
      html: otpTemplate.replaceAll('{{subject}}', subject).replaceAll('{{code}}', payload.code),
    })
  }
}
