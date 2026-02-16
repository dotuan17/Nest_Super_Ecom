import { Injectable } from '@nestjs/common'
import { Resend } from 'resend'
import envConfig from '../config'
import OTPEmail from 'emails/plaid-verify-identity'
import React from 'react'
import { render, pretty } from '@react-email/render';


@Injectable()
export class EmailService {
  private resend: Resend

  constructor() {
    this.resend = new Resend(envConfig.RESEND_API_KEY || '')
  }

  async sendOTP(payload: { email: string; code: string }) {
    const subject = 'Mã OTP của bạn'
    const html = await pretty(await render(<OTPEmail code={payload.code} title={subject}/>));
    return await this.resend.emails.send({
      from: 'Ecommerce Nest DVT <tuandosendemail@resend.dev>',
      to: [payload.email],
      subject: subject,
      // react: <OTPEmail code={payload.code} title={subject}/>,
      html: html,})
  }
}
