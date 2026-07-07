import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CryptographyizabilityAdminService } from './cryptographyizability-admin.service.js'
import { CryptographyizabilityController } from './cryptographyizability.controller.js'
import { CryptographyizabilityStatusService } from './cryptographyizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CryptographyizabilityController],
  providers: [CryptographyizabilityStatusService, CryptographyizabilityAdminService],
  exports: [CryptographyizabilityAdminService],
})
export class CryptographyizabilityModule {}
