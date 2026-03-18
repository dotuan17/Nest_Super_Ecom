import { Injectable } from '@nestjs/common'
import { PrismaService } from '../shared/services/prisma.service'
import { CreateLanguageBodyType, LanguageType, UpdateLanguageBodyType } from './language.model'
@Injectable()
export class LanguageRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async getLanguages(): Promise<LanguageType[]> {
    return await this.prismaService.language.findMany({
      where: {
        deletedAt: null,
      },
    })
  }
  async getLanguageById(languageId: string): Promise<LanguageType | null> {
    return await this.prismaService.language.findUnique({
      where: {
        id: languageId,
        deletedAt: null,
      },
    })
  }

  async createLanguage({
    createdById,
    data,
  }: {
    createdById: number
    data: CreateLanguageBodyType
  }): Promise<LanguageType> {
    return await this.prismaService.language.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  async updateLanguage({
    id,
    data,
    updatedById,
  }: {
    id: string
    data: UpdateLanguageBodyType
    updatedById: number
  }): Promise<LanguageType> {
    return await this.prismaService.language.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        updatedById,
      },
    })
  }

  async deleteLanguage(id: string, isHard?: boolean): Promise<LanguageType> {
    return isHard
      ? await this.prismaService.language.delete({
          where: {
            id,
          },
        })
      : await this.prismaService.language.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        })
  }
}
