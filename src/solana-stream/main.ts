import { solSubscriptions } from "@shared/solana/client"
import { BO_SC_PROGRAM_ADDRESS } from "@shared/solana/multiburn"
import { SCAN_COMMITMENT } from "@sol-scanner/config"
import { parseLogs } from "./log-parser"

const main = async () => {
	for (;;) {
		const controller = new AbortController()

		try {
			const stream = await solSubscriptions
				.logsNotifications({ mentions: [BO_SC_PROGRAM_ADDRESS] }, { commitment: SCAN_COMMITMENT })
				.subscribe({ abortSignal: controller.signal })

			for await (const noti of stream) {
				const events = parseLogs(noti.value.logs)
				console.log("events: ", events)
			}
		} catch (err) {
			console.error("Subscription dropped\n", err, "reconnecting...")
			controller.abort()
		}
	}
}

main()
