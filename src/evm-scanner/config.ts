import { availableSetting } from "@database/repository/setting"
import { parseChainArg } from "@shared/arg"

export const CHAIN_ID = parseChainArg()

export const BLOCK_RANGE = (() => {
	if (CHAIN_ID === 1) return BigInt(5000)
	return BigInt(4999)
})()

export const EVM_SCAN_CURSOR_SETTING = availableSetting.evmBlockScannerCursor(CHAIN_ID)
