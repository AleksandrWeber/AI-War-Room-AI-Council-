import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RiskizabilityAdminService } from './riskizability-admin.service.js'
import { RiskizabilityController } from './riskizability.controller.js'
import { RiskizabilityStatusService } from './riskizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RiskizabilityController],
  providers: [RiskizabilityStatusService, RiskizabilityAdminService],
  exports: [RiskizabilityAdminService],
})
export class RiskizabilityModule {}
