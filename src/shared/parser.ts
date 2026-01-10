import { isAddress as isSolanaAddress } from "@solana/kit"
import { getAddress, isAddress } from "viem"
import z from "zod"

export const zEvmAddress = () =>
	z
		.string()
		.refine(isAddress, "invalid evm address")
		.transform(address => getAddress(address))

export const zSolanaAddress = () =>
	z.string().refine(isSolanaAddress, "invalid solana address, expect bs58 address format")

export const zWaletAddress = () => z.union([zEvmAddress(), zSolanaAddress()])
