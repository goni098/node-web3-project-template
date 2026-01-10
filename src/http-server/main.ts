import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { HttpError } from "@fastify/sensible"
import fastify, { type FastifyError } from "fastify"
import {
	jsonSchemaTransform,
	serializerCompiler,
	validatorCompiler
} from "fastify-type-provider-zod"
import type { Auth } from "./plugin/auth"

declare module "fastify" {
	interface FastifyInstance {}

	interface FastifyRequest {
		auth: Auth
	}

	interface FastifyReply {}
}

fastify()
	.setValidatorCompiler(validatorCompiler)
	.setSerializerCompiler(serializerCompiler)
	.setErrorHandler((error, req, reply) => {
		if (isFastifyError(error) || error instanceof HttpError) return reply.send(error)
		console.error(`Unexpected error from ${req.url}\n`, error)
		return reply.internalServerError()
	})

	.register(import("@fastify/cors"))
	.register(import("@fastify/sensible"))
	.register(import("@fastify/swagger"), {
		openapi: {
			info: { title: "Multi burn", version: "1.0.0" },
			components: {
				securitySchemes: { bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" } }
			}
		},
		transform: jsonSchemaTransform
	})
	.register(import("@fastify/swagger-ui"), {
		theme: { title: "Multi burn API docs" },
		routePrefix: "/docs"
	})
	.register(import("@fastify/autoload"), {
		dir: join(dirname(fileURLToPath(import.meta.url)), "route"),
		matchFilter: path => path.includes("handler")
	})
	.get("/", () => "hello kitty!")
	.listen({ port: 8080, host: "0.0.0.0" })
	.then(socket => {
		console.log(`server is listening at ${socket}`)
	})
	.catch(error => {
		console.error("Tcp error ", error)
		process.exit(1)
	})

const isFastifyError = (error: unknown): error is FastifyError =>
	Object.hasOwn(error as object, "statusCode")
