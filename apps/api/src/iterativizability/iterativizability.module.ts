import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IterativizabilityAdminService } from './iterativizability-admin.service.js'
import { IterativizabilityController } from './iterativizability.controller.js'
import { IterativizabilityStatusService } from './iterativizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IterativizabilityController],
  providers: [IterativizabilityStatusService, IterativizabilityAdminService],
  exports: [IterativizabilityAdminService],
})
export class IterativizabilityModule {}
