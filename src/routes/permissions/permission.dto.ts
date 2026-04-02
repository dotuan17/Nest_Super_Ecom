import { createZodDto } from 'nestjs-zod';
import { CreatePermissionBodySchema, GetPermissionDetailResSchema, GetPermissionsParamsSchema, GetPermissionsQuerySchema, GetPermissionsResSchema, PermissionSchema, UpdatePermissionBodySchema } from './permission.model';

// class is required for using DTO as a type
export class PermissionResDTO extends createZodDto(PermissionSchema) {}
export class GetPermissionsResDTO extends createZodDto(GetPermissionsResSchema) {}
export class GetPermissionsQueryDTO extends createZodDto(GetPermissionsQuerySchema) {}
export class GetPermissionDetailResDTO extends createZodDto(GetPermissionDetailResSchema) {}
export class GetPermissionsParamsDTO extends createZodDto(GetPermissionsParamsSchema) {}
export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}
export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}
