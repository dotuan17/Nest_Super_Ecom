import { UnprocessableEntityException } from '@nestjs/common'

// OTP related errors
export const InvalidPermissionException = new UnprocessableEntityException([
  {
    message: 'Error.LanguageNotFound',
    path: 'permissionId',
  },
])

export const PermissionIsAlreadyExistException = new UnprocessableEntityException([
  {
    message: 'Error.PermissionIsAlreadyExist',
    path: 'id',
  },
])
