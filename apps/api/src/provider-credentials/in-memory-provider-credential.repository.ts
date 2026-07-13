import type {
  ManagedProviderId,
  MaskedProviderCredential,
} from '@ai-war-room/schemas'
import type {
  ProviderCredentialRecord,
  ProviderCredentialRepository,
  SaveProviderCredentialInput,
} from './provider-credential.repository.js'

export class InMemoryProviderCredentialRepository
  implements ProviderCredentialRepository
{
  private readonly credentials = new Map<string, ProviderCredentialRecord>()

  async listByWorkspace(workspaceId: string): Promise<ProviderCredentialRecord[]> {
    return [...this.credentials.values()].filter(
      (credential) => credential.workspaceId === workspaceId,
    )
  }

  async findById(
    workspaceId: string,
    credentialId: string,
  ): Promise<ProviderCredentialRecord | null> {
    const credential = this.credentials.get(credentialId)

    return credential?.workspaceId === workspaceId ? credential : null
  }

  async findByProvider(
    workspaceId: string,
    providerId: ManagedProviderId,
  ): Promise<ProviderCredentialRecord | null> {
    return (
      [...this.credentials.values()].find(
        (credential) =>
          credential.workspaceId === workspaceId &&
          credential.providerId === providerId,
      ) ?? null
    )
  }

  async save(
    input: SaveProviderCredentialInput,
  ): Promise<ProviderCredentialRecord> {
    const existing = await this.findByProvider(input.workspaceId, input.providerId)
    const credential: ProviderCredentialRecord = {
      credentialId: existing?.credentialId ?? input.credentialId,
      workspaceId: input.workspaceId,
      providerId: input.providerId,
      label: input.label,
      encryptedApiKey: input.encryptedApiKey,
      keyHint: input.keyHint,
      createdByUserId: existing?.createdByUserId ?? input.createdByUserId,
      createdAt: existing?.createdAt ?? input.now,
      updatedAt: input.now,
      lastTestedAt: undefined,
      lastTestStatus: 'untested',
      lastTestError: undefined,
    }

    this.credentials.set(credential.credentialId, credential)

    return credential
  }

  async delete(workspaceId: string, credentialId: string): Promise<boolean> {
    const credential = await this.findById(workspaceId, credentialId)

    if (!credential) {
      return false
    }

    return this.credentials.delete(credentialId)
  }

  async updateTestResult(input: {
    workspaceId: string
    credentialId: string
    testedAt: string
    status: MaskedProviderCredential['lastTestStatus']
    errorMessage?: string
  }): Promise<void> {
    const credential = await this.findById(input.workspaceId, input.credentialId)

    if (!credential) {
      return
    }

    this.credentials.set(input.credentialId, {
      ...credential,
      lastTestedAt: input.testedAt,
      lastTestStatus: input.status,
      lastTestError: input.errorMessage,
      updatedAt: input.testedAt,
    })
  }
}
