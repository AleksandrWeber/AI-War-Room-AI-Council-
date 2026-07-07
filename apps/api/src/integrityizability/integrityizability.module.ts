import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IntegrityizabilityAdminService } from './integrityizability-admin.service.js'
import { IntegrityizabilityController } from './integrityizability.controller.js'
import { IntegrityizabilityStatusService } from './integrityizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IntegrityizabilityController],
  providers: [IntegrityizabilityStatusService, IntegrityizabilityAdminService],
  exports: [IntegrityizabilityAdminService],
})
export class IntegrityizabilityModule {}
