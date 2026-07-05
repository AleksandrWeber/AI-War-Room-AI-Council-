import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HistorizabilityAdminService } from './historizability-admin.service.js'
import { HistorizabilityController } from './historizability.controller.js'
import { HistorizabilityStatusService } from './historizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HistorizabilityController],
  providers: [HistorizabilityStatusService, HistorizabilityAdminService],
  exports: [HistorizabilityAdminService],
})
export class HistorizabilityModule {}
