import { settingRepository } from "@database/repository/setting"
import { signature } from "@solana/kit"
import { SOLANA_SCAN_CURSOR_SETTING } from "./config"
import { getTheFirstSignature } from "./signature"

export const loadOrInitCursor = async () => {
	const cursor = await settingRepository.get(SOLANA_SCAN_CURSOR_SETTING)

	if (cursor) return signature(cursor)

	console.log("Finding the first signature of program...")

	const firstSignature = await getTheFirstSignature()

	if (!firstSignature) throw new Error("Not found the first signature")

	await settingRepository.insert(SOLANA_SCAN_CURSOR_SETTING, firstSignature)

	return firstSignature
}
