import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DesirabilityAdminService } from './desirability-admin.service.js'
import { DesirabilityController } from './desirability.controller.js'
import { DesirabilityStatusService } from './desirability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DesirabilityController],
  providers: [DesirabilityStatusService, DesirabilityAdminService],
  exports: [DesirabilityAdminService],
})
export class DesirabilityModule {}
