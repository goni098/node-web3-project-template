import { getPositionOpenedDecoder, getPositionSettledDecoder } from "@shared/solana/multiburn"
import { isNil, stripPrefix } from "@shared/util"
import { LOG_DISCRIMINATOR_SIZE } from "./config"

type MultiburnEvent = NonNullable<ReturnType<typeof deserialize>>

const Instruction = {
	OpenPosition: "Program log: Instruction: OpenPosition",
	SettlePosition: "Program log: Instruction: SettlePosition",
	SettleMultiplePositions: "Program log: Instruction: SettleMultiplePositions"
} as const

export const parseLogs = (logs: readonly string[]): MultiburnEvent[] => {
	const instruction = logs.find(log => Object.values<string>(Instruction).includes(log))

	if (!instruction) return []

	const events: MultiburnEvent[] = []

	for (const log of logs) {
		const logData = stripPrefix(log, "Program data: ")

		if (!isNil(logData)) {
			const bytes = Buffer.from(logData, "base64").subarray(LOG_DISCRIMINATOR_SIZE)
			const log = deserialize(instruction, bytes)
			if (log) {
				events.push(log)
			}
		}
	}

	return events
}

const deserialize = (instruction: string, bytes: Buffer) => {
	switch (instruction) {
		case Instruction.OpenPosition:
			return { data: getPositionOpenedDecoder().decode(bytes), event: "PositionOpened" } as const

		case Instruction.SettleMultiplePositions:
			return { data: getPositionSettledDecoder().decode(bytes), event: "PositionSettled" } as const

		case Instruction.SettlePosition:
			return { data: getPositionSettledDecoder().decode(bytes), event: "PositionSettled" } as const

		default:
			return null
	}
}
