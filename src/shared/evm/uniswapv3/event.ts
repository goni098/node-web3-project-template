import { UNISWAP_POOL_V3_ABI } from "./abi"

export const UNISWAP_POOL_V3_EVENT_SIGNATURES = UNISWAP_POOL_V3_ABI.filter(i => i.type === "event")
