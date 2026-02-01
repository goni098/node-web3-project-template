import { settingRepository } from "@database/repository/setting"
import { evmClient } from "@shared/evm/client"
import { UNISWAP_POOL_V2_EVENT_SIGNATURES } from "@shared/evm/uniswapv2/event"
import { UNISWAP_POOL_V3_EVENT_SIGNATURES } from "@shared/evm/uniswapv3/event"
import { minOf, sleep } from "@shared/util"
import { BLOCK_RANGE, EVM_SCAN_CURSOR_SETTING, SCAN_INTERVAL_MS } from "./config"
import { loadOrInitBlock } from "./cursor"

const main = async () => {
	let fromBlock = await loadOrInitBlock()

	console.log("starting scanner from block", fromBlock)

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

	const events = await evmClient.getLogs({
		address: [
			"0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", // v3 weth/usdc
			"0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc" // v2 weth/usdc
		],
		fromBlock,
		toBlock,
		events: [...UNISWAP_POOL_V2_EVENT_SIGNATURES, ...UNISWAP_POOL_V3_EVENT_SIGNATURES]
	})

	const next = toBlock + 1n

	await settingRepository.set(EVM_SCAN_CURSOR_SETTING, next.toString())

	console.log(`scanned from ${fromBlock} to ${toBlock} successfully, found ${events.length} logs `)

	return next
}

main()
