import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AssignabilityAdminService } from './assignability-admin.service.js'
import { AssignabilityController } from './assignability.controller.js'
import { AssignabilityStatusService } from './assignability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AssignabilityController],
  providers: [AssignabilityStatusService, AssignabilityAdminService],
  exports: [AssignabilityAdminService],
})
export class AssignabilityModule {}
