import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MemorabilityAdminService } from './memorability-admin.service.js'
import { MemorabilityController } from './memorability.controller.js'
import { MemorabilityStatusService } from './memorability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MemorabilityController],
  providers: [MemorabilityStatusService, MemorabilityAdminService],
  exports: [MemorabilityAdminService],
})
export class MemorabilityModule {}
