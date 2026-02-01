import z from "zod"
import "dotenv/config"

const schema = z.object({
	DATABASE_URL: z.url(),
	ACCESS_TOKEN_KEY: z.string().min(1),
	SOLANA_RPC: z.url(),
	SOLANA_WS_RPC: z.url()
})

export const { ACCESS_TOKEN_KEY, DATABASE_URL, SOLANA_RPC, SOLANA_WS_RPC } = schema.parse(
	process.env
)
