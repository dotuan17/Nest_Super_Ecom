import { NestFactory } from '@nestjs/core'
import { Prisma } from '@prisma/client'
import { AppModule } from '../src/app.module'
import { HTTPMethod } from '../src/routes/shared/constants/role.constant'
import { PrismaService } from '../src/routes/shared/services/prisma.service'

const prisma = new PrismaService()

async function bootstrap() {
    const app = await NestFactory.create(AppModule)
    await app.init()

    const expressApp = app.getHttpAdapter().getInstance()
    const router = expressApp._router

    if (!router?.stack) {
        throw new Error('Cannot read Express router stack')
    }

    const availableRoutes: Prisma.PermissionCreateManyInput[] = router.stack
        .flatMap((layer: any): Prisma.PermissionCreateManyInput[] => {
            if (!layer.route?.path) {
                return []
            }

            const path = layer.route.path
            const methods = Object.keys(layer.route.methods ?? {})

            return methods
                .filter((method) => layer.route.methods?.[method])
                .map((method) => {
                    const normalizedMethod = method.toUpperCase() as keyof typeof HTTPMethod

                    return {
                        path,
                        method: normalizedMethod,
                        name: `${normalizedMethod} ${path}`,
                    }
                })
        })
        .filter((route) => route.method in HTTPMethod)

    const uniqueRoutes: Prisma.PermissionCreateManyInput[] = Array.from(
        new Map(availableRoutes.map((route) => [`${route.method}:${route.path}`, route])).values(),
    )

    const existingPermissions = await prisma.permission.findMany({
        select: {
            path: true,
            method: true,
        },
    })

    const existingRouteKeys = new Set(
        existingPermissions.map((permission) => `${permission.method}:${permission.path}`),
    )

    const routesToCreate = uniqueRoutes.filter(
        (route) => !existingRouteKeys.has(`${route.method}:${route.path}`),
    )

    const result = routesToCreate.length
        ? await prisma.permission.createMany({
              data: routesToCreate,
          })
        : { count: 0 }

    console.log('result', result)

    await app.close()
    await prisma.$disconnect()
}
bootstrap().catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
})
