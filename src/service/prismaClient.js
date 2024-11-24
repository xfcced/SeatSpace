const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
	// log: ['query'],
})

process.on('SIGINT', async () => {
	await prisma.$disconnect()
	process.exit(0)
})

process.on('SIGTERM', async () => {
	await prisma.$disconnect()
	process.exit(0)
})

module.exports = prisma
