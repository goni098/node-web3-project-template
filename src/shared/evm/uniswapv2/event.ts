import { UNISWAP_POOL_V2_ABI } from "./abi"

export const UNISWAP_POOL_V2_EVENT_SIGNATURES = UNISWAP_POOL_V2_ABI.filter(i => i.type === "event")
