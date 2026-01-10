import { signingMessageRepository } from "@database/repository/signing-message"
import { zWaletAddress } from "@shared/parser"
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import { DateTime } from "luxon"
import z from "zod"

const handler: FastifyPluginAsyncZod = async self => {
	self.post(
		"/req-signing-message",
		{
			schema: {
				tags: ["users"],
				body: z.object({
					address: zWaletAddress()
				})
			}
		},
		async ({ body }) => {
			const message = `${DateTime.now().toMillis()}, Welcome`
			await signingMessageRepository.allocate(body.address, message)

			return {
				message
			}
		}
	)
}

export default handler
