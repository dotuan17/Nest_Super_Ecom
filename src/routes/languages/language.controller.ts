import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { LanguageService } from './language.service'
import { CreateLanguagesBodyDTO, GetLanguageDetailResDTO, GetLanguagesParamsDTO, GetLanguagesResDTO, UpdateLanguagesBodyDTO } from './language.dto'
import { ActiveUser } from '../shared/decorators/active-user.decorator'
import { MessageResDTO } from '../shared/dtos/response.dto'
@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {}

  @Get()
  @ZodSerializerDto(GetLanguagesResDTO)
  async getAllLanguages() {
    return await this.languageService.getLanguages()
  }

  @Get('detail/:languageId')
  @ZodSerializerDto(GetLanguageDetailResDTO)
  async getLanguageById(@Param('languageId') languageId: string) {
    return await this.languageService.getLanguageById(languageId)
  }

  @Post()
  @ZodSerializerDto(GetLanguageDetailResDTO)
  async createLanguage(@Body() body: CreateLanguagesBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.languageService.createLanguage({
      createdById: userId,
      data: body
    })
  }

  @Put(':languageId')
  @ZodSerializerDto(GetLanguageDetailResDTO)
  async updateLanguage(@Body() body: UpdateLanguagesBodyDTO, @Param() params:GetLanguagesParamsDTO, @ActiveUser('userId') userId: number) {
    return await this.languageService.updateLanguage({
      id: params.languageId,
      data: body,
      updatedById: userId
    })
  }

  @Delete(':languageId')
  @ZodSerializerDto(MessageResDTO)
  async deleteLanguage(@Param() params:GetLanguagesParamsDTO) {
    return await this.languageService.deleteLanguage(params.languageId)
  }
}
