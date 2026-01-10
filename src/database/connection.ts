import { PrismaPg } from "@prisma/adapter-pg"
import { DATABASE_URL } from "@shared/env"
import { PrismaClient } from "./generated/prisma/client"

export const prisma = new PrismaClient({
	adapter: new PrismaPg({ connectionString: DATABASE_URL })
})
