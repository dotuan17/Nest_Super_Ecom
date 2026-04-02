import { Injectable } from '@nestjs/common'
import { PrismaService } from '../shared/services/prisma.service'
import { CreatePermissionBodyType, GetPermissionDetailResType, GetPermissionsQueryType, GetPermissionsResType, PermissionType, UpdatePermissionBodyType } from './permission.model'

@Injectable()
export class PermissionRepository {
  constructor(private readonly prismaService: PrismaService) { }

  async getAll(pagination: GetPermissionsQueryType): Promise<GetPermissionsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const [data, total] = await Promise.all([
      this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),

      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
    ])

    return {
      data,
      totalItems: total,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(total / pagination.limit),
    }
  }

  async findById(id: number) {
    const data = await this.prismaService.permission.findUnique({
      where: {
        id,
      }
    })
    return data
  }

  async create({ data, createdById }: { data: CreatePermissionBodyType, createdById: number | null }): Promise<PermissionType> {
    const result = await this.prismaService.permission.create({
      data: {
        ...data,
        createdById: createdById
      }
    })
    return result;
  }

  async update({ data, id, updatedById }: { data: UpdatePermissionBodyType, id: number, updatedById: number }) {
    const result = await this.prismaService.permission.update({
      where: {
        id,
      },
      data: {
        ...data,
        updatedById: updatedById
      }
    })
    return result;
  }

  async delete({ id, deletedById }: { id: number, deletedById: number }, isHard?: boolean) {
    return isHard ?
      await this.prismaService.permission.delete({
        where: {
          id,
        },
      })
      :
      await this.prismaService.permission.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
          deletedById: deletedById
        }
      })
  }
}
