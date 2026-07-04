import { Module, forwardRef } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { ApiEnv } from '../config/env.js'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InMemoryProviderCredentialRepository } from './in-memory-provider-credential.repository.js'
import { PostgresProviderCredentialRepository } from './postgres-provider-credential.repository.js'
import { ProviderCredentialEncryptionService } from './provider-credential-encryption.service.js'
import { ProviderCredentialTesterService } from './provider-credential-tester.service.js'
import { PROVIDER_CREDENTIAL_REPOSITORY } from './provider-credential.repository.js'
import { ProviderCredentialsAdminService } from './provider-credentials-admin.service.js'
import { ProviderCredentialsController } from './provider-credentials.controller.js'
import { ProviderCredentialsService } from './provider-credentials.service.js'

@Module({
  imports: [PersistenceModule, forwardRef(() => AuthModule), WorkspacesModule],
  controllers: [ProviderCredentialsController],
  providers: [
    PostgresProviderCredentialRepository,
    ProviderCredentialEncryptionService,
    ProviderCredentialTesterService,
    ProviderCredentialsService,
    ProviderCredentialsAdminService,
    {
      provide: PROVIDER_CREDENTIAL_REPOSITORY,
      inject: [ConfigService, PostgresProviderCredentialRepository],
      useFactory: (
        configService: ConfigService<ApiEnv, true>,
        postgresRepository: PostgresProviderCredentialRepository,
      ) => {
        return configService.get('NODE_ENV', { infer: true }) === 'test'
          ? new InMemoryProviderCredentialRepository()
          : postgresRepository
      },
    },
  ],
  exports: [ProviderCredentialsService, ProviderCredentialsAdminService],
})
export class ProviderCredentialsModule {}
