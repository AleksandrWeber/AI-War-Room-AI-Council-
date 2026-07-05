import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SplitizabilityAdminService } from './splitizability-admin.service.js'
import { SplitizabilityController } from './splitizability.controller.js'
import { SplitizabilityStatusService } from './splitizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SplitizabilityController],
  providers: [SplitizabilityStatusService, SplitizabilityAdminService],
  exports: [SplitizabilityAdminService],
})
export class SplitizabilityModule {}
