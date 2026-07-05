import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DurabilityAdminService } from './durability-admin.service.js'
import { DurabilityController } from './durability.controller.js'
import { DurabilityStatusService } from './durability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DurabilityController],
  providers: [DurabilityStatusService, DurabilityAdminService],
  exports: [DurabilityAdminService],
})
export class DurabilityModule {}
