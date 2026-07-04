import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'
import type { ApiEnv } from '../config/env.js'

@Injectable()
export class ProviderCredentialEncryptionService {
  constructor(private readonly configService: ConfigService<ApiEnv, true>) {}

  encrypt(plainText: string) {
    const iv = randomBytes(12)
    const cipher = createCipheriv('aes-256-gcm', this.getKey(), iv)
    const encrypted = Buffer.concat([
      cipher.update(plainText, 'utf8'),
      cipher.final(),
    ])
    const tag = cipher.getAuthTag()

    return [
      'v1',
      iv.toString('base64url'),
      tag.toString('base64url'),
      encrypted.toString('base64url'),
    ].join(':')
  }

  decrypt(encryptedValue: string) {
    const [version, iv, tag, encrypted] = encryptedValue.split(':')

    if (version !== 'v1' || !iv || !tag || !encrypted) {
      throw new Error('Unsupported provider credential encryption format.')
    }

    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.getKey(),
      Buffer.from(iv, 'base64url'),
    )
    decipher.setAuthTag(Buffer.from(tag, 'base64url'))

    return Buffer.concat([
      decipher.update(Buffer.from(encrypted, 'base64url')),
      decipher.final(),
    ]).toString('utf8')
  }

  private getKey() {
    return createHash('sha256')
      .update(this.configService.get('APP_ENCRYPTION_KEY', { infer: true }))
      .digest()
  }
}
