import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CompliancevaultizabilityAdminService } from './compliancevaultizability-admin.service.js'
import { CompliancevaultizabilityController } from './compliancevaultizability.controller.js'
import { CompliancevaultizabilityStatusService } from './compliancevaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CompliancevaultizabilityController],
  providers: [CompliancevaultizabilityStatusService, CompliancevaultizabilityAdminService],
  exports: [CompliancevaultizabilityAdminService],
})
export class CompliancevaultizabilityModule {}
