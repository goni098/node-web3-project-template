export const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export const retry = async <T>(
	lazy: () => Promise<T>,
	attemp: number,
	delayMs: number,
	onErr?: (error: unknown) => void
): Promise<T> => {
	let count = 0
	for (;;) {
		try {
			const result = await lazy()
			return result
		} catch (error) {
			if (onErr) onErr(error)

			if (delayMs) await sleep(delayMs)

			if (count > attemp) {
				console.error(`Retry reached after ${attemp} times`)
				throw error
			}

			count += 1
		}
	}
}

export const lastOf = <T>(arr: T[] | ReadonlyArray<T>): T | undefined => arr[arr.length - 1]

export const firstOf = <T>(arr: T[] | ReadonlyArray<T>): T | undefined => arr[0]

export const isEmpty = (arr: unknown[] | ReadonlyArray<unknown>): boolean => arr.length === 0

export const stripPrefix = (str: string, prefix: string) =>
	str.startsWith(prefix) ? str.slice(prefix.length) : null

export const isNil = (val: unknown): val is undefined | null => val === undefined || val === null

export const minOf = (...values: bigint[]): bigint => values.reduce((a, b) => (a < b ? a : b))
