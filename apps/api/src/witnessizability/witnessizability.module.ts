import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { WitnessizabilityAdminService } from './witnessizability-admin.service.js'
import { WitnessizabilityController } from './witnessizability.controller.js'
import { WitnessizabilityStatusService } from './witnessizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [WitnessizabilityController],
  providers: [WitnessizabilityStatusService, WitnessizabilityAdminService],
  exports: [WitnessizabilityAdminService],
})
export class WitnessizabilityModule {}
