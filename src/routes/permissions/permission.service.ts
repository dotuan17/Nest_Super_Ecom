import { Injectable } from '@nestjs/common'
import { PermissionRepository } from './permission.repo'
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './permission.model'
import { NotFoundRecordException } from '../shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from '../shared/helpers'
import { PermissionIsAlreadyExistException } from './permission.error'

@Injectable()
export class PermissionService {
  constructor(private readonly permissionRepository: PermissionRepository) { }

  async getAll(pagination: GetPermissionsQueryType) {
    const result = await this.permissionRepository.getAll(pagination)
    return result
  }

  async findById(permissionId: number) {
    const result = await this.permissionRepository.findById(permissionId)
    if (!result) {
      throw NotFoundRecordException
    }
    return result
  }

  async create({ data, createdById }: { data: CreatePermissionBodyType, createdById: number }) {
    try {
      return await this.permissionRepository.create({ data, createdById })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionIsAlreadyExistException
      }
    }
  }

  async update({ data, id, updatedById }: { data: UpdatePermissionBodyType, id: number, updatedById: number }) {
    try {
      return await this.permissionRepository.update({ data, id, updatedById })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }

      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionIsAlreadyExistException
      }
    }
  }

  async delete({ id, deletedById }: { id: number, deletedById: number }) {
    try {
      await this.permissionRepository.delete({ id, deletedById }, true)
      return {
        message: 'Delete successfully'
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
    }
  }
}
