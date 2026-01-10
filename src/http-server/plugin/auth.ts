import type { Role } from "@database/generated/prisma/enums"
import { verify } from "@node-rs/jsonwebtoken"
import { ACCESS_TOKEN_KEY } from "@shared/env"
import type { WalletAddress } from "@shared/type"
import type { FastifyPluginAsync } from "fastify"
import fastifyPlugin from "fastify-plugin"

export interface Auth {
	address: WalletAddress
	role: Role
}

export interface Claims {
	data: Auth
	iat: number
	exp: number
}

const plugin: FastifyPluginAsync<{ role?: Role }> = async (self, { role }) => {
	self.addHook("onRequest", async (request, reply) => {
		const [_, token] = request.headers.authorization?.split("Bearer ") ?? []
		if (!token) return reply.unauthorized("Missing bearer token")

		try {
			const auth = (await verify(token, ACCESS_TOKEN_KEY)) as Claims

			if (role && auth.data.role !== role) return reply.forbidden("Permission denied")

			request.auth = auth.data
		} catch (error) {
			return reply.unauthorized(String(error))
		}
	})
}

export const authPlugin = fastifyPlugin(plugin)
