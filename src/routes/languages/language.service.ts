import { Injectable } from '@nestjs/common/decorators/core/injectable.decorator'
import { LanguageRepository } from './language.repo'
import { InvalidLanguageException, LanguageIsAlreadyExistException } from './language.error'
import { CreateLanguageBodyType, UpdateLanguageBodyType } from './language.model'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '../shared/helpers'
import { NotFoundRecordException } from '../shared/error'
@Injectable()
export class LanguageService {
  constructor(private readonly languageRepository: LanguageRepository) {}

  async getLanguages() {
    const languages = await this.languageRepository.getLanguages()
    return {
      data: languages,
      totalItems: languages.length,
    }
  }
  async getLanguageById(languageId: string) {
    const language = await this.languageRepository.getLanguageById(languageId)
    if (!language) {
      throw NotFoundRecordException
    }
    return language
  }
  async createLanguage({createdById, data}: {createdById: number, data: CreateLanguageBodyType}) {
    try {
      return await this.languageRepository.createLanguage({
        createdById,
        data
      })
    } catch (error) {
      if(isUniqueConstraintPrismaError(error)){
        throw LanguageIsAlreadyExistException
      }
      throw error
    }
  }
  async updateLanguage({id, data, updatedById}: {id: string, data: UpdateLanguageBodyType, updatedById: number}) {
    try {
      return await this.languageRepository.updateLanguage({
        id,
        data,
        updatedById
      })
    } catch (error) {
      if(isNotFoundPrismaError(error)){
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async deleteLanguage(id:string) {
    try {
       await this.languageRepository.deleteLanguage(id, true)
       return {
          message:'Delete language successfully'
       }
    } catch (error) {
      if(isNotFoundPrismaError(error)){
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
