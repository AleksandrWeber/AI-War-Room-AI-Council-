import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ScalabilizabilityAdminService } from './scalabilizability-admin.service.js'
import { ScalabilizabilityController } from './scalabilizability.controller.js'
import { ScalabilizabilityStatusService } from './scalabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ScalabilizabilityController],
  providers: [ScalabilizabilityStatusService, ScalabilizabilityAdminService],
  exports: [ScalabilizabilityAdminService],
})
export class ScalabilizabilityModule {}
