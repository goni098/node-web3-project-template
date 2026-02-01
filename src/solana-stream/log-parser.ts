import { createHash } from "node:crypto"
import { getPositionOpenedDecoder, getPositionSettledDecoder } from "@shared/solana/bo"
import { isNil, stripPrefix } from "@shared/util"
import { LOG_DISCRIMINATOR_SIZE } from "./config"

type MultiburnEvent = NonNullable<ReturnType<typeof deserialize>>
type EventName = (typeof eventNames)[number]

const eventNames = ["PositionOpened", "PositionSettled"] as const

const eventDiscriminator = (name: string) =>
	createHash("sha256").update(`event:${name}`, "utf8").digest().subarray(0, 8)

const eventDecoders = new Map<string, (bytes: Buffer) => MultiburnEvent>()

eventNames.forEach(event => {
	const discriminator = eventDiscriminator(event).toString("hex")
	eventDecoders.set(discriminator, (bytes: Buffer) => deserialize(event, bytes))
})

const deserialize = (event: EventName, bytes: Buffer) => {
	switch (event) {
		case "PositionOpened":
			return {
				data: getPositionOpenedDecoder().decode(bytes),
				event
			} as const

		case "PositionSettled":
			return {
				data: getPositionSettledDecoder().decode(bytes),
				event
			} as const
	}
}

export const parseLogs = (logs: readonly string[]): MultiburnEvent[] => {
	const events: MultiburnEvent[] = []

	for (const log of logs) {
		const logData = stripPrefix(log, "Program data: ")

		if (isNil(logData)) continue

		const bytes = Buffer.from(logData, "base64")
		const discriminatorHex = bytes.subarray(0, LOG_DISCRIMINATOR_SIZE).toString("hex")

		const decoder = eventDecoders.get(discriminatorHex)

		if (!decoder) continue

		const event = decoder(bytes.subarray(LOG_DISCRIMINATOR_SIZE))

		events.push(event)
	}

	return events
}
