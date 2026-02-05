import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const UserSchema = z.object({
  id: z.number(),
  email: z.email(),
  phoneNumber: z.string(),
  name: z.string(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
}).strict()

const RegisterBodySchema = z.object({
  email: z.string(),
  phoneNumber: z.string().min(9).max(15),
  name: z.string().min(2).max(100),
  password: z.string().min(6).max(100),
  confirmPassword: z.string().min(6).max(100),
}).strict().superRefine(({ confirmPassword, password }, ctx) => {
  if (password !== confirmPassword) {
    ctx.addIssue({
      code: 'custom',
      message: 'Passwords do not match',
      path: ['confirmPassword'],
    });
  }
});

// class is required for using DTO as a type
export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class RegisterResponseDTO extends createZodDto(UserSchema) {}