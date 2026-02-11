import z from 'zod'
import fs from 'fs'
import path from 'path'
import { config } from 'dotenv'

config({
  path: path.resolve('.env'),
})

if (!fs.existsSync(path.resolve('.env'))) {
  console.log('Khong tim thay file .env')
  process.exit(1)
}

const configSchema = z.object({
  DATABASE_URL: z.string(),
  ACCESS_TOKEN_SECRET: z.string(),
  REFRESH_TOKEN_SECRET: z.string(),
  ACCESS_TOKEN_EXPIRES_IN: z.string(),
  REFRESH_TOKEN_EXPIRES_IN: z.string(),
  PORT: z.string(),
  SECRET_API_KEY: z.string(),
  ADMIN_NAME: z.string(),
  ADMIN_PASSWORD: z.string(),
  ADMIN_EMAIL: z.string(),
  ADMIN_PHONE_NUMBER: z.string(),
  OTP_EXPIRES_IN: z.string(),
})

const configServer = configSchema.safeParse(process.env)

if (configServer.success === false) {
  console.log('cac gia tri khai bao trong file .env khong hop le');
  console.error(configServer.error);
  process.exit(1);
}

  const envConfig =  configServer.data

  export default envConfig