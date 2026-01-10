import { availableSetting } from "@database/repository/setting"

export const CONCURRENCY_SIGNATURE = 30
export const SCAN_INTERVAL_MS = 6_000
export const SIGNATURE_HANDLE_INTERVAL_MS = 1_000
export const SCAN_COMMITMENT = "finalized" as const
export const SOLANA_SCAN_CURSOR_SETTING = availableSetting.solSignatureScannerCursor()
