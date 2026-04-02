import { Body, Controller, Delete, Get, Param, Post, Put, Query } from "@nestjs/common";
import { PermissionService } from "./permission.service";
import { ZodSerializerDto } from "nestjs-zod";
import { CreatePermissionBodyDTO, GetPermissionDetailResDTO, GetPermissionsParamsDTO, GetPermissionsQueryDTO, GetPermissionsResDTO, UpdatePermissionBodyDTO } from "./permission.dto";
import { ActiveUser } from "../shared/decorators/active-user.decorator";
import { MessageResDTO } from "../shared/dtos/response.dto";

@Controller('permissions')
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) { }

  @Get()
  @ZodSerializerDto(GetPermissionsResDTO)
  async getAllPermissions(@Query() query: GetPermissionsQueryDTO) {
    return await this.permissionService.getAll({
      page: query.page,
      limit: query.limit
    })
  }

  @Get('detail/:permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  async getPermissionsDetail(@Param() param: GetPermissionsParamsDTO) {
    return await this.permissionService.findById(param.permissionId)
  }

  @Post()
  @ZodSerializerDto(GetPermissionDetailResDTO)
  async createPermissions(@Body() body: CreatePermissionBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.permissionService.create({
      data: body,
      createdById: userId
    })
  }

  @Put('/:permissionId')
  @ZodSerializerDto(GetPermissionDetailResDTO)
  async updatePermissions(@Body() body: UpdatePermissionBodyDTO, @Param() params: GetPermissionsParamsDTO, @ActiveUser('userId') userId: number) {
    return await this.permissionService.update({
      data: body,
      id: params.permissionId,
      updatedById: userId
    })
  }

  @Delete('/:permissionId')
  @ZodSerializerDto(MessageResDTO)
  async deletePermissions(@Param() params: GetPermissionsParamsDTO, @ActiveUser('userId') userId: number) {
    return await this.permissionService.delete({
      id: params.permissionId,
      deletedById: userId
    })
  }
}