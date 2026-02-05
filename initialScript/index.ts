import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constant'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'

const prismaService = new PrismaService()
const hashingService = new HashingService()
const main = async () => {
  console.log('create role');
  const roleCount = await prismaService.role.count()
  if (roleCount > 0) {
    throw new Error('Roles already exist in the database.')
  }
  const roles = await prismaService.role.createMany({
    data: [
      {
        name: RoleName.ADMIN,
        description: 'Administrator with full access',
      },
      {
        name: RoleName.CLIENT,
        description: 'Client with limited access',
      },
      {
        name: RoleName.SELLER,
        description: 'Seller with product management access',
      },
    ],
  })

  const adminRole = await prismaService.role.findFirstOrThrow({
    where: { name: RoleName.ADMIN },
  })
  const hashedPassword = await hashingService.hash(envConfig.ADMIN_PASSWORD)
  const adminUser = await prismaService.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: hashedPassword,
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  })
  return {
    createdRoleCount: roles.count,
    adminUser,
  }
}

main()
  .then(({ createdRoleCount, adminUser }) => {
    console.log(`Created ${createdRoleCount} roles.`);
    console.log('Created admin user:', adminUser.email);
  })
  .catch((error) => {
    console.error('Error executing initial script:', error)
    process.exit(1)
  })