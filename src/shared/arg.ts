export const parseChainArg = () => {
	const args = process.argv.slice(2)
	const chain = args[args.indexOf("--chain-id") + 1]

	if (!chain) {
		throw new Error("Missing --chain-id argument")
	}

	return parseInt(chain, 10)
}
