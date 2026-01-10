import { solClient } from "@shared/solana/client"
import { BO_SC_PROGRAM_ADDRESS } from "@shared/solana/multiburn/index"
import { isEmpty, lastOf } from "@shared/util"
import type { Signature } from "@solana/kit"
import { SCAN_COMMITMENT as commitment } from "./config"

export const getTheFirstSignature = async () => {
	let before: Signature | undefined
	let firstSignature: Signature | undefined

	for (;;) {
		const page = await solClient
			.getSignaturesForAddress(BO_SC_PROGRAM_ADDRESS, { commitment, before })
			.send()

		if (isEmpty(page)) return firstSignature

		const last = lastOf(page)?.signature

		before = last
		firstSignature = last
	}
}

export const retrieveTxs = async (curor: Signature) => {
	const page = await solClient
		.getSignaturesForAddress(BO_SC_PROGRAM_ADDRESS, { commitment, until: curor })
		.send()

	if (isEmpty(page)) {
		console.log("No new tx found")
		return []
	}

	let before = lastOf(page)?.signature

	for (;;) {
		const orderPage = await solClient
			.getSignaturesForAddress(BO_SC_PROGRAM_ADDRESS, {
				commitment,
				until: curor,
				before
			})
			.send()

		if (isEmpty(orderPage)) return page

		before = lastOf(orderPage)?.signature
		;(page as Array<unknown>).push(...orderPage)
	}
}
