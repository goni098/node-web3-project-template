import { solClient } from "@shared/solana/client"
import { sleep } from "@shared/util"
import { parseLogs } from "@sol-stream/log-parser"
import type { GetSignaturesForAddressApi } from "@solana/kit"
import {
	CONCURRENCY_SIGNATURE,
	SCAN_COMMITMENT as commitment,
	SIGNATURE_HANDLE_INTERVAL_MS
} from "./config"

type GetSignaturesForAddressResponse = ReturnType<
	GetSignaturesForAddressApi["getSignaturesForAddress"]
>

type Tx = GetSignaturesForAddressResponse[number]

export const consumeTxs = async (txs: GetSignaturesForAddressResponse) => {
	const queue = [...txs]

	while (queue.length > 0) {
		const batch = queue.splice(0, CONCURRENCY_SIGNATURE)

		const results = await Promise.allSettled(batch.map(handleTx))

		await sleep(SIGNATURE_HANDLE_INTERVAL_MS)

		results.forEach((res, i) => {
			if (res.status === "rejected") {
				console.warn(`handle failed ${batch[i]!.signature}`, res.reason?.message)
				queue.push(batch[i]!)
			}
		})
	}
}

const handleTx = async (tx: Tx) => {
	const signature = tx.signature

	console.log("processing signature ", signature)

	const txn = await solClient.getTransaction(signature, { commitment, encoding: "json" }).send()

	const ts = txn?.blockTime ?? 0

	const logs = txn?.meta?.logMessages

	if (!logs) return

	const events = parseLogs(logs)

	ts && events
}
