import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IntegrabilizabilityAdminService } from './integrabilizability-admin.service.js'
import { IntegrabilizabilityController } from './integrabilizability.controller.js'
import { IntegrabilizabilityStatusService } from './integrabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IntegrabilizabilityController],
  providers: [IntegrabilizabilityStatusService, IntegrabilizabilityAdminService],
  exports: [IntegrabilizabilityAdminService],
})
export class IntegrabilizabilityModule {}
