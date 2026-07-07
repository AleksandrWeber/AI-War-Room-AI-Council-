import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComplianceproofizabilityAdminService } from './complianceproofizability-admin.service.js'
import { ComplianceproofizabilityController } from './complianceproofizability.controller.js'
import { ComplianceproofizabilityStatusService } from './complianceproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComplianceproofizabilityController],
  providers: [ComplianceproofizabilityStatusService, ComplianceproofizabilityAdminService],
  exports: [ComplianceproofizabilityAdminService],
})
export class ComplianceproofizabilityModule {}
