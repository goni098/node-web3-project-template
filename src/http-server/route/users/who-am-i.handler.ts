import { userRepository } from "@database/repository/user"
import { authPlugin } from "@http-server/plugin/auth"
import { SECURITY_TAG } from "@shared/const"
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod"

const handler: FastifyPluginAsyncZod = async self => {
	self.register(authPlugin).get(
		"/me",
		{
			schema: {
				security: SECURITY_TAG,
				tags: ["users"]
			}
		},
		async ({ auth }, reply) => {
			const user = await userRepository.findByAddress(auth.address)

			if (!user) return reply.internalServerError(`not found user with address ${auth.address}`)

			return {
				address: user.address
			}
		}
	)
}

export default handler
