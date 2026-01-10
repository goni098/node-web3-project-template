import { parseChainArg } from "@shared/arg"
import { createPublicClient, createWalletClient, http, publicActions, webSocket } from "viem"
import "dotenv/config"

const rpc = (chainId: number, ws = false) => {
	const envVar = `${ws ? "WS_RPC" : "RPC"}_CHAIN_${chainId}`
	const rpcUrl = process.env[envVar]

	if (!rpcUrl) throw new Error(`Missing ${envVar}`)

	return rpcUrl
}

const transport = http(rpc(parseChainArg()))

const wsTransport = webSocket(rpc(parseChainArg(), true))

export const evmClient = createPublicClient({ transport })

export const evmWsClient = createPublicClient({ transport: wsTransport })

export const walletClient = createWalletClient({ transport }).extend(publicActions)
