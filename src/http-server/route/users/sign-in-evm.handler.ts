import { signingMessageRepository } from "@database/repository/signing-message"
import { createUserAndSignToken } from "@http-server/shared/user"
import { zEvmAddress } from "@shared/parser"
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { isHex, verifyMessage } from "viem"
import z from "zod"

const handler: FastifyPluginAsyncZod = async self => {
	self.post(
		"/evm/sign-in",
		{
			schema: {
				tags: ["users"],
				body: z.object({
					address: zEvmAddress(),
					message: z.string(),
					signature: z.string().refine(isHex, "expect hex signature format")
				})
			}
		},
		async ({ body }, reply) => {
			const message = await signingMessageRepository.get(body.address)

			if (!message || message !== body.message)
				return reply.unauthorized("message is invalid or it was revoked")

			const valid = await verifyMessage({
				address: body.address,
				message: body.message,
				signature: body.signature
			})

			if (!valid) return reply.unauthorized("Wrong signature")

			const token = await createUserAndSignToken(body.address)

			return {
				token
			}
		}
	)
}

export default handler
