import z from "zod"
import "dotenv/config"

const schema = z.object({
	DATABASE_URL: z.url(),
	ACCESS_TOKEN_KEY: z.string().min(1)
})

export const { ACCESS_TOKEN_KEY, DATABASE_URL } = schema.parse(process.env)
