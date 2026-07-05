import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConsumizabilityAdminService } from './consumizability-admin.service.js'
import { ConsumizabilityController } from './consumizability.controller.js'
import { ConsumizabilityStatusService } from './consumizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConsumizabilityController],
  providers: [ConsumizabilityStatusService, ConsumizabilityAdminService],
  exports: [ConsumizabilityAdminService],
})
export class ConsumizabilityModule {}
