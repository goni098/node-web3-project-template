import { settingRepository } from "@database/repository/setting"
import { BO_SC_PROGRAM_ADDRESS } from "@shared/solana/bo"
import { firstOf, sleep } from "@shared/util"
import type { Signature } from "@solana/kit"
import { SCAN_INTERVAL_MS, SOLANA_SCAN_CURSOR_SETTING } from "./config"
import { loadOrInitCursor } from "./cursor"
import { consumeTxs } from "./handler"
import { retrieveTxs } from "./signature"

const main = async () => {
	let cursor = await loadOrInitCursor()

	console.log("Events scanner started, program_id: ", BO_SC_PROGRAM_ADDRESS)
	console.log("Starting from signature: ", cursor)

	for (;;) {
		try {
			cursor = await scan(cursor)
			await sleep(SCAN_INTERVAL_MS)
		} catch (error) {
			console.error(error)
			await sleep(3000)
		}
	}
}

const scan = async (cursor: Signature) => {
	const signatures = await retrieveTxs(cursor)
	const nextCursor = firstOf(signatures)?.signature

	await consumeTxs(signatures)

	if (nextCursor) {
		await settingRepository.set(SOLANA_SCAN_CURSOR_SETTING, nextCursor)
		return nextCursor
	}

	return cursor
}

main()
