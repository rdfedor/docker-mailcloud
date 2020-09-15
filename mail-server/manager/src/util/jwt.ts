import { sign, verify } from 'jsonwebtoken'
import { getPublicKey, getPrivateKey } from './crypto'

export const buildToken = async (data) => {
  const privateKey = await getPrivateKey()

  return sign(
    data,
    {
      key: privateKey,
      passphrase: '',
    },
    {
      algorithm: 'RS256',
      expiresIn: '2hr',
    },
  )
}

export const verifyToken = async (payload) => {
  const publicKey = await getPublicKey()

  return verify(payload, publicKey, { algorithm: 'RS256' })
}
