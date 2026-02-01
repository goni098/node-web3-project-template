import { evmWsClient } from "@shared/evm/client"
import { UNISWAP_POOL_V2_EVENT_SIGNATURES } from "@shared/evm/uniswapv2/event"
import { UNISWAP_POOL_V3_EVENT_SIGNATURES } from "@shared/evm/uniswapv3/event"
import { DateTime } from "luxon"

const main = async () => {
	evmWsClient.watchEvent({
		address: [
			"0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8", // v3 weth/usdc
			"0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc" // v2 weth/usdc
		],
		events: [...UNISWAP_POOL_V2_EVENT_SIGNATURES, ...UNISWAP_POOL_V3_EVENT_SIGNATURES],
		onLogs: logs => {
			const blockNumber = logs[0]?.blockNumber
			console.log(DateTime.now().toISO(), `block ${blockNumber} found ${logs.length} logs`)
		},
		onError: error => {
			console.error("error: ", error)
		},
		poll: false
	})

	console.log("watching...")

	await new Promise(() => {})
}

main()
