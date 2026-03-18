import z from 'zod'

export const LanguageSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetLanguagesResSchema = z.object({
  data: z.array(LanguageSchema),
  totalItems: z.number(),
})

export const GetLanguagesDetailResSchema = LanguageSchema

export const GetLanguagesParamsSchema = z.object({
  languageId: z.string().max(10)
}).strict()

export const CreateLanguagesBodySchema = LanguageSchema.pick({
  id:true,
  name: true,
}).strict()

export const UpdateLanguagesBodySchema = LanguageSchema.pick({
  name: true,
}).strict()

export type LanguageType= z.infer<typeof LanguageSchema>
export type GetLanguagesResType = z.infer<typeof GetLanguagesResSchema>
export type GetLanguageDetailResType = z.infer<typeof GetLanguagesDetailResSchema>
export type GetLanguagesParamsType = z.infer<typeof GetLanguagesParamsSchema>
export type CreateLanguageBodyType = z.infer<typeof CreateLanguagesBodySchema>
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguagesBodySchema>