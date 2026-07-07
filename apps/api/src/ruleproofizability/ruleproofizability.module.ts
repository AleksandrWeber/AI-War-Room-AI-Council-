import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RuleproofizabilityAdminService } from './ruleproofizability-admin.service.js'
import { RuleproofizabilityController } from './ruleproofizability.controller.js'
import { RuleproofizabilityStatusService } from './ruleproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RuleproofizabilityController],
  providers: [RuleproofizabilityStatusService, RuleproofizabilityAdminService],
  exports: [RuleproofizabilityAdminService],
})
export class RuleproofizabilityModule {}
