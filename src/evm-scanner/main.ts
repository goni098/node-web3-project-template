import { settingRepository } from "@database/repository/setting"
import { evmClient } from "@shared/evm/client"
import { minOf, sleep } from "@shared/util"
import { erc20Abi } from "viem"
import { BLOCK_RANGE, EVM_SCAN_CURSOR_SETTING } from "./config"
import { loadOrInitBlock } from "./cursor"

const main = async () => {
	let fromBlock = await loadOrInitBlock()

	for (;;) {
		try {
			fromBlock = await scan(fromBlock)
			await sleep(10_000)
		} catch (error) {
			console.error(`Scan error from block ${fromBlock.toString()}\n`, error)
			await sleep(3000)
		}
	}
}

const scan = async (fromBlock: bigint) => {
	const latestBlock = await evmClient.getBlock().then(({ number }) => number)

	const toBlock = minOf(latestBlock - BigInt(2), fromBlock + BLOCK_RANGE)

	const events = await evmClient.getContractEvents({
		address: [],
		fromBlock,
		toBlock,
		abi: erc20Abi
	})

	console.log("events: ", events)

	await settingRepository.set(EVM_SCAN_CURSOR_SETTING, toBlock.toString())

	return latestBlock + BigInt(1)
}

main()
