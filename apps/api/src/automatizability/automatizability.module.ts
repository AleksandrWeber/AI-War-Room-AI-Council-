import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AutomatizabilityAdminService } from './automatizability-admin.service.js'
import { AutomatizabilityController } from './automatizability.controller.js'
import { AutomatizabilityStatusService } from './automatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AutomatizabilityController],
  providers: [AutomatizabilityStatusService, AutomatizabilityAdminService],
  exports: [AutomatizabilityAdminService],
})
export class AutomatizabilityModule {}
