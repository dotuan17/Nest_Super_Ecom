import z from "zod";
import { HTTPMethod } from "../shared/constants/role.constant";

export const PermissionSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().default(""),
  path: z.string(),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  module: z.string().default(""),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GetPermissionsResSchema = z.object({
  data: z.array(PermissionSchema),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
  totalItems: z.number(),
});

export const GetPermissionsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10)
}).strict();

export const GetPermissionDetailResSchema = PermissionSchema;

export const GetPermissionsParamsSchema = z.object({
  permissionId: z.coerce.number(),
}).strict();

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
  module: true,
}).strict();

export const UpdatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  description: true,
  path: true,
  method: true,
  module: true,
}).strict();

export type PermissionType = z.infer<typeof PermissionSchema>;
export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>;
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>
export type GetPermissionDetailResType = z.infer<typeof GetPermissionDetailResSchema>;
export type GetPermissionsParamsType = z.infer<typeof GetPermissionsParamsSchema>;
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>;
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>;