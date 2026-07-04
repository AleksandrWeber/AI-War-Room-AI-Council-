import type {
  ManagedLlmProviderId,
  MaskedProviderCredential,
} from '@ai-war-room/schemas'

export const PROVIDER_CREDENTIAL_REPOSITORY = Symbol(
  'PROVIDER_CREDENTIAL_REPOSITORY',
)

export type ProviderCredentialRecord = Omit<
  MaskedProviderCredential,
  'maskedKey'
> & {
  encryptedApiKey: string
  keyHint: string
}

export type SaveProviderCredentialInput = {
  credentialId: string
  workspaceId: string
  providerId: ManagedLlmProviderId
  label: string
  encryptedApiKey: string
  keyHint: string
  createdByUserId: string
  now: string
}

export interface ProviderCredentialRepository {
  listByWorkspace(workspaceId: string): Promise<ProviderCredentialRecord[]>
  findById(
    workspaceId: string,
    credentialId: string,
  ): Promise<ProviderCredentialRecord | null>
  findByProvider(
    workspaceId: string,
    providerId: ManagedLlmProviderId,
  ): Promise<ProviderCredentialRecord | null>
  save(input: SaveProviderCredentialInput): Promise<ProviderCredentialRecord>
  delete(workspaceId: string, credentialId: string): Promise<boolean>
  updateTestResult(input: {
    workspaceId: string
    credentialId: string
    testedAt: string
    status: 'passed' | 'failed'
    errorMessage?: string
  }): Promise<void>
}
