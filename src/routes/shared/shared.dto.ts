export class SuccessResDTO {
  statusCode: string

  constructor(partial: Partial<SuccessResDTO>) {
    Object.assign(this, partial)
  }
}
