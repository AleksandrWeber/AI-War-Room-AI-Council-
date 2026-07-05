import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EfficiencyAdminService } from './efficiency-admin.service.js'
import { EfficiencyController } from './efficiency.controller.js'
import { EfficiencyStatusService } from './efficiency-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EfficiencyController],
  providers: [EfficiencyStatusService, EfficiencyAdminService],
  exports: [EfficiencyAdminService],
})
export class EfficiencyModule {}
