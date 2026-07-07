import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComplianceledgerizabilityAdminService } from './complianceledgerizability-admin.service.js'
import { ComplianceledgerizabilityController } from './complianceledgerizability.controller.js'
import { ComplianceledgerizabilityStatusService } from './complianceledgerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComplianceledgerizabilityController],
  providers: [ComplianceledgerizabilityStatusService, ComplianceledgerizabilityAdminService],
  exports: [ComplianceledgerizabilityAdminService],
})
export class ComplianceledgerizabilityModule {}
