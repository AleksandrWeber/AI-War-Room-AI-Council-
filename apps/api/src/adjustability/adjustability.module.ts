import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AdjustabilityAdminService } from './adjustability-admin.service.js'
import { AdjustabilityController } from './adjustability.controller.js'
import { AdjustabilityStatusService } from './adjustability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AdjustabilityController],
  providers: [AdjustabilityStatusService, AdjustabilityAdminService],
  exports: [AdjustabilityAdminService],
})
export class AdjustabilityModule {}
