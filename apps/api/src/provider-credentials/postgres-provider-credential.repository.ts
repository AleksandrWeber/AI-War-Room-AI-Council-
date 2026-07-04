import { Injectable } from '@nestjs/common'
import type { ManagedLlmProviderId } from '@ai-war-room/schemas'
import { PostgresService } from '../persistence/postgres.service.js'
import type {
  ProviderCredentialRecord,
  ProviderCredentialRepository,
  SaveProviderCredentialInput,
} from './provider-credential.repository.js'

type ProviderCredentialRow = {
  credential_id: string
  workspace_id: string
  provider_id: ManagedLlmProviderId
  label: string
  encrypted_api_key: string
  key_hint: string
  created_by_user_id: string
  created_at: Date
  updated_at: Date
  last_tested_at: Date | null
  last_test_status: ProviderCredentialRecord['lastTestStatus']
  last_test_error: string | null
}

@Injectable()
export class PostgresProviderCredentialRepository
  implements ProviderCredentialRepository
{
  constructor(private readonly postgresService: PostgresService) {}

  async listByWorkspace(workspaceId: string): Promise<ProviderCredentialRecord[]> {
    const result = await this.postgresService.query<ProviderCredentialRow>(
      `
        SELECT *
        FROM workspace_provider_credentials
        WHERE workspace_id = $1
        ORDER BY provider_id ASC, created_at ASC
      `,
      [workspaceId],
    )

    return result.rows.map((row) => this.parseRow(row))
  }

  async findById(
    workspaceId: string,
    credentialId: string,
  ): Promise<ProviderCredentialRecord | null> {
    const result = await this.postgresService.query<ProviderCredentialRow>(
      `
        SELECT *
        FROM workspace_provider_credentials
        WHERE workspace_id = $1
          AND credential_id = $2
        LIMIT 1
      `,
      [workspaceId, credentialId],
    )

    return result.rows[0] ? this.parseRow(result.rows[0]) : null
  }

  async findByProvider(
    workspaceId: string,
    providerId: ManagedLlmProviderId,
  ): Promise<ProviderCredentialRecord | null> {
    const result = await this.postgresService.query<ProviderCredentialRow>(
      `
        SELECT *
        FROM workspace_provider_credentials
        WHERE workspace_id = $1
          AND provider_id = $2
        LIMIT 1
      `,
      [workspaceId, providerId],
    )

    return result.rows[0] ? this.parseRow(result.rows[0]) : null
  }

  async save(
    input: SaveProviderCredentialInput,
  ): Promise<ProviderCredentialRecord> {
    const result = await this.postgresService.query<ProviderCredentialRow>(
      `
        INSERT INTO workspace_provider_credentials (
          credential_id,
          workspace_id,
          provider_id,
          label,
          encrypted_api_key,
          key_hint,
          created_by_user_id,
          created_at,
          updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8)
        ON CONFLICT (workspace_id, provider_id)
        DO UPDATE SET
          label = EXCLUDED.label,
          encrypted_api_key = EXCLUDED.encrypted_api_key,
          key_hint = EXCLUDED.key_hint,
          updated_at = EXCLUDED.updated_at,
          last_tested_at = NULL,
          last_test_status = 'untested',
          last_test_error = NULL
        RETURNING *
      `,
      [
        input.credentialId,
        input.workspaceId,
        input.providerId,
        input.label,
        input.encryptedApiKey,
        input.keyHint,
        input.createdByUserId,
        input.now,
      ],
    )

    return this.parseRow(result.rows[0]!)
  }

  async delete(workspaceId: string, credentialId: string): Promise<boolean> {
    const result = await this.postgresService.query(
      `
        DELETE FROM workspace_provider_credentials
        WHERE workspace_id = $1
          AND credential_id = $2
      `,
      [workspaceId, credentialId],
    )

    return Boolean(result.rowCount)
  }

  async updateTestResult(input: {
    workspaceId: string
    credentialId: string
    testedAt: string
    status: 'passed' | 'failed'
    errorMessage?: string
  }): Promise<void> {
    await this.postgresService.query(
      `
        UPDATE workspace_provider_credentials
        SET last_tested_at = $3,
            last_test_status = $4,
            last_test_error = $5,
            updated_at = $3
        WHERE workspace_id = $1
          AND credential_id = $2
      `,
      [
        input.workspaceId,
        input.credentialId,
        input.testedAt,
        input.status,
        input.errorMessage ?? null,
      ],
    )
  }

  private parseRow(row: ProviderCredentialRow): ProviderCredentialRecord {
    return {
      credentialId: row.credential_id,
      workspaceId: row.workspace_id,
      providerId: row.provider_id,
      label: row.label,
      encryptedApiKey: row.encrypted_api_key,
      keyHint: row.key_hint,
      createdByUserId: row.created_by_user_id,
      createdAt: row.created_at.toISOString(),
      updatedAt: row.updated_at.toISOString(),
      lastTestedAt: row.last_tested_at?.toISOString(),
      lastTestStatus: row.last_test_status,
      lastTestError: row.last_test_error ?? undefined,
    }
  }
}
