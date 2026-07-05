import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HermeticizabilityAdminService } from './hermeticizability-admin.service.js'
import { HermeticizabilityController } from './hermeticizability.controller.js'
import { HermeticizabilityStatusService } from './hermeticizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HermeticizabilityController],
  providers: [HermeticizabilityStatusService, HermeticizabilityAdminService],
  exports: [HermeticizabilityAdminService],
})
export class HermeticizabilityModule {}
