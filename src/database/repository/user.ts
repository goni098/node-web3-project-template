import { prisma } from "@database/connection"
import type { Role } from "@database/generated/prisma/enums"
import type { WalletAddress } from "@shared/type"

const findByAddress = async (address: WalletAddress) =>
	prisma.user.findFirst({
		where: { address }
	})

const createIfNotExist = async (address: WalletAddress, role: Role = "normal") =>
	prisma.user.upsert({
		create: { address, role },
		where: { address },
		update: {}
	})

export const userRepository = {
	findByAddress,
	createIfNotExist
}
