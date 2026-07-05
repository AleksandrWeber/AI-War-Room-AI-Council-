import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { UtilizationAdminService } from './utilization-admin.service.js'
import { UtilizationController } from './utilization.controller.js'
import { UtilizationStatusService } from './utilization-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [UtilizationController],
  providers: [UtilizationStatusService, UtilizationAdminService],
  exports: [UtilizationAdminService],
})
export class UtilizationModule {}
