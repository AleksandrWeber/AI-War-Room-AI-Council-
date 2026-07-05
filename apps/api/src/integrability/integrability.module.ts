import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IntegrabilityAdminService } from './integrability-admin.service.js'
import { IntegrabilityController } from './integrability.controller.js'
import { IntegrabilityStatusService } from './integrability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IntegrabilityController],
  providers: [IntegrabilityStatusService, IntegrabilityAdminService],
  exports: [IntegrabilityAdminService],
})
export class IntegrabilityModule {}
