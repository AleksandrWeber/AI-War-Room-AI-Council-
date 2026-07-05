import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PersistizabilityAdminService } from './persistizability-admin.service.js'
import { PersistizabilityController } from './persistizability.controller.js'
import { PersistizabilityStatusService } from './persistizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PersistizabilityController],
  providers: [PersistizabilityStatusService, PersistizabilityAdminService],
  exports: [PersistizabilityAdminService],
})
export class PersistizabilityModule {}
