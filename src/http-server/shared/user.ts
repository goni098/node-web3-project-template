import { signingMessageRepository } from "@database/repository/signing-message"
import { userRepository } from "@database/repository/user"
import type { Claims } from "@http-server/plugin/auth"
import { sign } from "@node-rs/jsonwebtoken"
import { ACCESS_TOKEN_KEY } from "@shared/env"
import type { WalletAddress } from "@shared/type"
import { DateTime } from "luxon"

export const createUserAndSignToken = async (address: WalletAddress) => {
	const user = await userRepository.createIfNotExist(address)

	const iat = DateTime.now().toSeconds()
	const aDayInSecs = 86400

	const claims: Claims = {
		data: {
			address: user.address as WalletAddress,
			role: user.role
		},
		iat,
		exp: iat + aDayInSecs
	}

	const token = await sign(claims, ACCESS_TOKEN_KEY)

	await signingMessageRepository.revoke(address)

	return token
}
