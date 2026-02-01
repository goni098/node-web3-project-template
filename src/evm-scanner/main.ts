import { settingRepository } from "@database/repository/setting"
import { evmClient } from "@shared/evm/client"
import { minOf, sleep } from "@shared/util"
import { erc20Abi } from "viem"
import { BLOCK_RANGE, EVM_SCAN_CURSOR_SETTING, SCAN_INTERVAL_MS } from "./config"
import { loadOrInitBlock } from "./cursor"

const main = async () => {
	let fromBlock = await loadOrInitBlock()

	for (;;) {
		try {
			fromBlock = await scan(fromBlock)
			await sleep(SCAN_INTERVAL_MS)
		} catch (error) {
			console.error(`Scan error from block ${fromBlock.toString()}\n`, error)
			await sleep(3000)
		}
	}
}

const scan = async (fromBlock: bigint) => {
	const latestBlock = await evmClient.getBlock().then(({ number }) => number)

	if (fromBlock > latestBlock) {
		return fromBlock
	}

	const toBlock = minOf(latestBlock - 2n, fromBlock + BLOCK_RANGE)

	if (toBlock < fromBlock) {
		return fromBlock
	}

	const events = await evmClient.getContractEvents({
		address: [],
		fromBlock,
		toBlock,
		abi: erc20Abi
	})

	console.log("events: ", events)

	const next = latestBlock + 1n

	await settingRepository.set(EVM_SCAN_CURSOR_SETTING, next.toString())

	return next
}

main()
