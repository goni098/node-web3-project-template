import { settingRepository } from "@database/repository/setting"
import { evmClient } from "@shared/evm/client"
import { minOf, sleep } from "@shared/util"
import { erc20Abi } from "viem"
import { BLOCK_RANGE, EVM_SCAN_CURSOR_SETTING, SCAN_INTERVAL_MS } from "./config"
import { loadOrInitBlock } from "./cursor"

const main = async () => {
	let fromBlock = await loadOrInitBlock()

	console.log("starting scanner from block ", fromBlock)

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
		address: ["0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"],
		fromBlock,
		toBlock,
		eventName: "Approval",
		abi: erc20Abi
	})

	console.log("events: ", events.length)

	const next = toBlock + 1n

	await settingRepository.set(EVM_SCAN_CURSOR_SETTING, next.toString())

	console.log(`scanned from ${fromBlock} to ${toBlock} successfully`)

	return next
}

main()
