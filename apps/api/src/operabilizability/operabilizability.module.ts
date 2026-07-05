import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OperabilizabilityAdminService } from './operabilizability-admin.service.js'
import { OperabilizabilityController } from './operabilizability.controller.js'
import { OperabilizabilityStatusService } from './operabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OperabilizabilityController],
  providers: [OperabilizabilityStatusService, OperabilizabilityAdminService],
  exports: [OperabilizabilityAdminService],
})
export class OperabilizabilityModule {}
