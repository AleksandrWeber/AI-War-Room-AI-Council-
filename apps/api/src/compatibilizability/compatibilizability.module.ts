import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CompatibilizabilityAdminService } from './compatibilizability-admin.service.js'
import { CompatibilizabilityController } from './compatibilizability.controller.js'
import { CompatibilizabilityStatusService } from './compatibilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CompatibilizabilityController],
  providers: [CompatibilizabilityStatusService, CompatibilizabilityAdminService],
  exports: [CompatibilizabilityAdminService],
})
export class CompatibilizabilityModule {}
