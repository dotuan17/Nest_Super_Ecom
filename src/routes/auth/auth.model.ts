import z from "zod";
import { TypeOfVerificationCode } from "../shared/constants/auth.constant";
import { UserSchema } from "../shared/models/shared-user.model";

// User Schema
export const RegisterBodySchema = UserSchema.pick({
    email: true,
    password: true,
    name: true,
    phoneNumber: true,
}).extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6)
}).strict().superRefine(({ confirmPassword, password }, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
  }
});

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>;

export const RegisterResSchema = UserSchema.omit({
    password: true,
    totpSecret: true,
});

export type RegisterResType = z.infer<typeof RegisterResSchema>;

// Verification Code Schema
export const VerificationCode = z.object({
    id: z.number(),
    email: z.email(),
    code: z.string().length(6),
    type: z.enum([ TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD, TypeOfVerificationCode.LOGIN, TypeOfVerificationCode.DISABLE_2FA ]),
    expiresAt: z.date(),
    createdAt: z.date(),
}).strict();

export type VerificationCodeType = z.infer<typeof VerificationCode>;

// Send OTP Body Schema
export const SendOTPBodySchema = VerificationCode.pick({
    email: true,
    type: true,
}).strict();

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>;