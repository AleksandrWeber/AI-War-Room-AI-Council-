import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NodelizabilityAdminService } from './nodelizability-admin.service.js'
import { NodelizabilityController } from './nodelizability.controller.js'
import { NodelizabilityStatusService } from './nodelizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NodelizabilityController],
  providers: [NodelizabilityStatusService, NodelizabilityAdminService],
  exports: [NodelizabilityAdminService],
})
export class NodelizabilityModule {}
