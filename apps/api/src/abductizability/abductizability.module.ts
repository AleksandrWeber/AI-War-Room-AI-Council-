import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AbductizabilityAdminService } from './abductizability-admin.service.js'
import { AbductizabilityController } from './abductizability.controller.js'
import { AbductizabilityStatusService } from './abductizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AbductizabilityController],
  providers: [AbductizabilityStatusService, AbductizabilityAdminService],
  exports: [AbductizabilityAdminService],
})
export class AbductizabilityModule {}
