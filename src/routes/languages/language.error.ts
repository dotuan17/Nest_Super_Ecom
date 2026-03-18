import { UnprocessableEntityException } from '@nestjs/common'

// OTP related errors
export const InvalidLanguageException = new UnprocessableEntityException([
  {
    message: 'Error.LanguageNotFound',
    path: 'languageId',
  },
])

export const LanguageIsAlreadyExistException = new UnprocessableEntityException([
  {
    message: 'Error.LanguageIsAlreadyExist',
    path: 'id',
  },
])

