import {
	createSolanaRpc,
	createSolanaRpcSubscriptions,
	sendAndConfirmTransactionFactory
} from "@solana/kit"

export const solClient = createSolanaRpc("https://api.devnet.solana.com")

export const solSubscriptions = createSolanaRpcSubscriptions("wss://api.devnet.solana.com")

export const sendAndConfirmTransaction = sendAndConfirmTransactionFactory({
	rpc: solClient,
	rpcSubscriptions: solSubscriptions
})
