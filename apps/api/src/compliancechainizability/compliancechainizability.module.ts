import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CompliancechainizabilityAdminService } from './compliancechainizability-admin.service.js'
import { CompliancechainizabilityController } from './compliancechainizability.controller.js'
import { CompliancechainizabilityStatusService } from './compliancechainizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CompliancechainizabilityController],
  providers: [CompliancechainizabilityStatusService, CompliancechainizabilityAdminService],
  exports: [CompliancechainizabilityAdminService],
})
export class CompliancechainizabilityModule {}
