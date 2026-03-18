import z from 'zod'
import { TypeOfVerificationCode } from '../shared/constants/auth.constant'
import { UserSchema } from '../shared/models/shared-user.model'

// User Schema
export const RegisterBodySchema = UserSchema.pick({
  email: true,
  password: true,
  name: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z.string().min(6).max(100),
    code: z.string().length(6),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (password !== confirmPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmPassword'],
      })
    }
  })

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

// Verification Code Schema
export const VerificationCodeSchema = z
  .object({
    id: z.number(),
    email: z.email(),
    code: z.string().length(6),
    type: z.enum([
      TypeOfVerificationCode.REGISTER,
      TypeOfVerificationCode.FORGOT_PASSWORD,
      TypeOfVerificationCode.LOGIN,
      TypeOfVerificationCode.DISABLE_2FA,
    ]),
    expiresAt: z.date(),
    createdAt: z.date(),
  })
  .strict()

// Send OTP Body Schema
export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
}).strict()

// Login Body Schema
export const LoginBodySchema = z
  .object({
    email: z.email(),
    password: z.string().min(6).max(100),
  })
  .extend({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    const message = 'Cung cấp mã xác thực 2FA hoặc mã OTP, không được cung cấp cả hai'
    if (totpCode && code) {
      ctx.addIssue({
        code: 'custom',
        message,
        path: ['totpCode'],
      })
      ctx.addIssue({
        code: 'custom',
        message,
        path: ['code'],
      })
    }
  })

export const LoginResSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

// Refresh Token Body Schema
export const RefreshTokenBodySchema = z
  .object({
    refreshToken: z.string(),
  })
  .strict()

export const RefreshTokenResSchema = LoginResSchema

// Device Schema
export const DeviceSchema = z
  .object({
    id: z.number(),
    userId: z.number(),
    userAgent: z.string(),
    ip: z.string(),
    lastActive: z.date(),
    createdAt: z.date(),
    isActive: z.boolean(),
  })
  .strict()

// Role Schema
export const RoleSchema = z
  .object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .strict()

// Refresh Token Schema
export const RefreshTokenSchema = z
  .object({
    userId: z.number(),
    token: z.string(),
    deviceId: z.number(),
    expiresAt: z.date(),
    createdAt: z.date(),
  })
  .strict()

export const LogoutBodySchema = RefreshTokenBodySchema

export const ForgotPasswordBodySchema = z
  .object({
    email: z.email(),
    code: z.string().length(6),
    newPassword: z.string().min(6).max(100),
    confirmNewPassword: z.string().min(6).max(100),
  })
  .strict()
  .superRefine(({ confirmNewPassword, newPassword }, ctx) => {
    if (newPassword !== confirmNewPassword) {
      ctx.addIssue({
        code: 'custom',
        message: 'Passwords do not match',
        path: ['confirmNewPassword'],
      })
    }
  })

export const Disable2FASchema = z
  .object({
    totpCode: z.string().length(6).optional(),
    code: z.string().length(6).optional(),
  })
  .strict()
  .superRefine(({ totpCode, code }, ctx) => {
    if (totpCode !== undefined && code !== undefined) {
      ctx.addIssue({
        code: 'custom',
        message: 'Cung cap ma xac thuc 2FA hoac ma xac thuc OTP',
        path: ['totpCode'],
      })
      ctx.addIssue({
        code: 'custom',
        path: ['code'],
        message: 'Cung cap ma xac thuc 2FA hoac ma xac thuc OTP',
      })
    }
  })

export const TwoFactorSetupResSchema = z.object({
  secret: z.string(),
  uri: z.string(),
})

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>
export type RegisterResType = z.infer<typeof RegisterResSchema>
export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>
export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>
export type LoginBodyType = z.infer<typeof LoginBodySchema>
export type LoginResType = z.infer<typeof LoginResSchema>
export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>
export type RefreshTokenResType = z.infer<typeof RefreshTokenResSchema>
export type DeviceType = z.infer<typeof DeviceSchema>
export type RoleType = z.infer<typeof RoleSchema>
export type RefreshTokenType = z.infer<typeof RefreshTokenSchema>
export type LogoutBodyType = z.infer<typeof LogoutBodySchema>
export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>
export type Disable2FABodyType = z.infer<typeof Disable2FASchema>
export type TwoFactorSetupResType = z.infer<typeof TwoFactorSetupResSchema>
