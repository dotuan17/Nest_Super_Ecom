import { createZodDto } from 'nestjs-zod';
import { CreateLanguagesBodySchema, GetLanguagesDetailResSchema, GetLanguagesParamsSchema, GetLanguagesResSchema, LanguageSchema, UpdateLanguagesBodySchema } from './language.model';

// class is required for using DTO as a type
export class LanguageResDTO extends createZodDto(LanguageSchema) {}
export class GetLanguagesResDTO extends createZodDto(GetLanguagesResSchema) {}
export class GetLanguageDetailResDTO extends createZodDto(GetLanguagesDetailResSchema) {}
export class GetLanguagesParamsDTO extends createZodDto(GetLanguagesParamsSchema) {}
export class CreateLanguagesBodyDTO extends createZodDto(CreateLanguagesBodySchema) {}
export class UpdateLanguagesBodyDTO extends createZodDto(UpdateLanguagesBodySchema) {}