import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { WarmizabilityAdminService } from './warmizability-admin.service.js'
import { WarmizabilityController } from './warmizability.controller.js'
import { WarmizabilityStatusService } from './warmizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [WarmizabilityController],
  providers: [WarmizabilityStatusService, WarmizabilityAdminService],
  exports: [WarmizabilityAdminService],
})
export class WarmizabilityModule {}
