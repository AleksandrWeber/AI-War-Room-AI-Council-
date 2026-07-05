import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MemorizabilityAdminService } from './memorizability-admin.service.js'
import { MemorizabilityController } from './memorizability.controller.js'
import { MemorizabilityStatusService } from './memorizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MemorizabilityController],
  providers: [MemorizabilityStatusService, MemorizabilityAdminService],
  exports: [MemorizabilityAdminService],
})
export class MemorizabilityModule {}
