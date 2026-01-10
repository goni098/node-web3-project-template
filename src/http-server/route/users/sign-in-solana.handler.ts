import { signingMessageRepository } from "@database/repository/signing-message"
import { createUserAndSignToken } from "@http-server/shared/user"
import { zSolanaAddress } from "@shared/parser"
import {
	getBase58Encoder,
	getPublicKeyFromAddress,
	getUtf8Encoder,
	isSignature,
	signatureBytes,
	verifySignature
} from "@solana/kit"
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import z from "zod"

const handler: FastifyPluginAsyncZod = async self => {
	self.post(
		"/solana/sign-in",
		{
			schema: {
				tags: ["users"],
				body: z.object({
					address: zSolanaAddress(),
					message: z.string(),
					signature: z
						.string()
						.refine(isSignature, "invalid signature, expected bs58 signature format")
				})
			}
		},
		async ({ body }, reply) => {
			const message = await signingMessageRepository.get(body.address)

			if (!message || message !== body.message)
				return reply.unauthorized("message is invalid or it was revoked")

			const pubkey = await getPublicKeyFromAddress(body.address)
			const signature = getBase58Encoder().encode(body.signature)
			const clientMessage = getUtf8Encoder().encode(body.message)

			const valid = await verifySignature(pubkey, signatureBytes(signature), clientMessage)

			if (!valid) return reply.unauthorized("Wrong signature")

			const token = await createUserAndSignToken(body.address)

			return {
				token
			}
		}
	)
}

export default handler
