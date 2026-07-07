import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CompliancejournalizabilityAdminService } from './compliancejournalizability-admin.service.js'
import { CompliancejournalizabilityController } from './compliancejournalizability.controller.js'
import { CompliancejournalizabilityStatusService } from './compliancejournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CompliancejournalizabilityController],
  providers: [CompliancejournalizabilityStatusService, CompliancejournalizabilityAdminService],
  exports: [CompliancejournalizabilityAdminService],
})
export class CompliancejournalizabilityModule {}
