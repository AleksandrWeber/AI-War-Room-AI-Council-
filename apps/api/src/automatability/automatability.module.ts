import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AutomatabilityAdminService } from './automatability-admin.service.js'
import { AutomatabilityController } from './automatability.controller.js'
import { AutomatabilityStatusService } from './automatability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AutomatabilityController],
  providers: [AutomatabilityStatusService, AutomatabilityAdminService],
  exports: [AutomatabilityAdminService],
})
export class AutomatabilityModule {}
