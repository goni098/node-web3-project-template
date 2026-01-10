import { settingRepository } from "@database/repository/setting"
import { evmClient } from "@shared/evm/client"
import { EVM_SCAN_CURSOR_SETTING } from "./config"

export const loadOrInitBlock = async () => {
	const scannedBlock = await settingRepository.get(EVM_SCAN_CURSOR_SETTING)

	if (scannedBlock) {
		return BigInt(scannedBlock)
	}

	const latestBlock = await evmClient.getBlock()

	await settingRepository.insert(EVM_SCAN_CURSOR_SETTING, latestBlock.number.toString())

	return latestBlock.number
}
