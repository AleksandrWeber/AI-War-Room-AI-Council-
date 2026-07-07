import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComplianceguardizabilityAdminService } from './complianceguardizability-admin.service.js'
import { ComplianceguardizabilityController } from './complianceguardizability.controller.js'
import { ComplianceguardizabilityStatusService } from './complianceguardizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComplianceguardizabilityController],
  providers: [ComplianceguardizabilityStatusService, ComplianceguardizabilityAdminService],
  exports: [ComplianceguardizabilityAdminService],
})
export class ComplianceguardizabilityModule {}
