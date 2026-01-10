import { prisma } from "@database/connection"

type Setting = ReturnType<(typeof availableSetting)[keyof typeof availableSetting]>

const asKey = (setting: Setting) => {
	switch (setting.type) {
		case "sol_signature_scanner_cursor":
			return setting.type

		case "evm_block_scanner_cursor":
			return `${setting.type}_chain_${setting.chainId}`

		default:
			throw new Error(String(setting))
	}
}

const get = (setting: Setting) =>
	prisma.setting
		.findFirst({ where: { key: asKey(setting) }, select: { value: true } })
		.then(record => record?.value)

const set = (setting: Setting, value: string) =>
	prisma.setting.update({
		where: { key: asKey(setting) },
		data: { value }
	})

const insert = (setting: Setting, value: string) =>
	prisma.setting.create({ data: { key: asKey(setting), value } })

export const settingRepository = { get, insert, set }

export const availableSetting = {
	evmBlockScannerCursor(chainId: number) {
		return { type: "evm_block_scanner_cursor", chainId } as const
	},
	solSignatureScannerCursor() {
		return { type: "sol_signature_scanner_cursor" } as const
	}
} as const
