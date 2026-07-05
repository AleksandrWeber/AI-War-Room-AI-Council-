import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EvocatabilityAdminService } from './evocatability-admin.service.js'
import { EvocatabilityController } from './evocatability.controller.js'
import { EvocatabilityStatusService } from './evocatability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EvocatabilityController],
  providers: [EvocatabilityStatusService, EvocatabilityAdminService],
  exports: [EvocatabilityAdminService],
})
export class EvocatabilityModule {}
