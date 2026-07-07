import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConfidentialityizabilityAdminService } from './confidentialityizability-admin.service.js'
import { ConfidentialityizabilityController } from './confidentialityizability.controller.js'
import { ConfidentialityizabilityStatusService } from './confidentialityizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConfidentialityizabilityController],
  providers: [ConfidentialityizabilityStatusService, ConfidentialityizabilityAdminService],
  exports: [ConfidentialityizabilityAdminService],
})
export class ConfidentialityizabilityModule {}
