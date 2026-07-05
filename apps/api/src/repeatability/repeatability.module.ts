import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RepeatabilityAdminService } from './repeatability-admin.service.js'
import { RepeatabilityController } from './repeatability.controller.js'
import { RepeatabilityStatusService } from './repeatability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RepeatabilityController],
  providers: [RepeatabilityStatusService, RepeatabilityAdminService],
  exports: [RepeatabilityAdminService],
})
export class RepeatabilityModule {}
