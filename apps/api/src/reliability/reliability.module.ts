import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReliabilityAdminService } from './reliability-admin.service.js'
import { ReliabilityController } from './reliability.controller.js'
import { ReliabilityStatusService } from './reliability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReliabilityController],
  providers: [ReliabilityStatusService, ReliabilityAdminService],
  exports: [ReliabilityAdminService],
})
export class ReliabilityModule {}
