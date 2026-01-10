import { prisma } from "@database/connection"
import type { WalletAddress } from "@shared/type"

const allocate = (address: WalletAddress, message: string) => {
	if (message.length > 98) throw new Error("message too long")

	return prisma.signingMessage.upsert({
		create: { address, message },
		update: { message },
		where: { address }
	})
}

const revoke = (address: WalletAddress) =>
	prisma.signingMessage.deleteMany({
		where: { address }
	})

const get = (address: WalletAddress) =>
	prisma.signingMessage.findFirst({ where: { address } }).then(record => record?.message)

export const signingMessageRepository = { allocate, revoke, get }
