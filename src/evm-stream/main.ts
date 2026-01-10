import { evmWsClient } from "@shared/evm/client"
import { erc20Abi } from "viem"

const main = async () => {
	for (;;) {
		try {
			evmWsClient.watchContractEvent({
				abi: erc20Abi,
				onLogs: logs => {
					console.log("logs: ", logs)
				},
				onError: error => {
					console.log("error: ", error)
				}
			})
		} catch {}
	}
}

main()
