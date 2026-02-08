
import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'

dotenv.config()
console.log('DATABASE_URL loaded:', process.env.DATABASE_URL ? 'YES' : 'NO')

const prisma = new PrismaClient()

async function main() {
    const automations = await prisma.automation.findMany({
        orderBy: { createdAt: 'desc' },
        take: 1,
        include: {
            trigger: true,
            listener: true,
            keywords: true,
            posts: true,
            user: { include: { integrations: true } }
        }
    })

    console.log(JSON.stringify(automations, null, 2))
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
