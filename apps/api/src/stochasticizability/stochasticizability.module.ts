import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { StochasticizabilityAdminService } from './stochasticizability-admin.service.js'
import { StochasticizabilityController } from './stochasticizability.controller.js'
import { StochasticizabilityStatusService } from './stochasticizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [StochasticizabilityController],
  providers: [StochasticizabilityStatusService, StochasticizabilityAdminService],
  exports: [StochasticizabilityAdminService],
})
export class StochasticizabilityModule {}
