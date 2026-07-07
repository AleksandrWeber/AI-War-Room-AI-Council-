import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComplianceizabilityAdminService } from './complianceizability-admin.service.js'
import { ComplianceizabilityController } from './complianceizability.controller.js'
import { ComplianceizabilityStatusService } from './complianceizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComplianceizabilityController],
  providers: [ComplianceizabilityStatusService, ComplianceizabilityAdminService],
  exports: [ComplianceizabilityAdminService],
})
export class ComplianceizabilityModule {}
