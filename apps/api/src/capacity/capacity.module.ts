import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CapacityAdminService } from './capacity-admin.service.js'
import { CapacityController } from './capacity.controller.js'
import { CapacityStatusService } from './capacity-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CapacityController],
  providers: [CapacityStatusService, CapacityAdminService],
  exports: [CapacityAdminService],
})
export class CapacityModule {}
