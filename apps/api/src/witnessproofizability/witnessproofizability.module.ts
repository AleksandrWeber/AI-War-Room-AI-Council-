import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { WitnessproofizabilityAdminService } from './witnessproofizability-admin.service.js'
import { WitnessproofizabilityController } from './witnessproofizability.controller.js'
import { WitnessproofizabilityStatusService } from './witnessproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [WitnessproofizabilityController],
  providers: [WitnessproofizabilityStatusService, WitnessproofizabilityAdminService],
  exports: [WitnessproofizabilityAdminService],
})
export class WitnessproofizabilityModule {}
