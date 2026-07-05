import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { StandardizabilityAdminService } from './standardizability-admin.service.js'
import { StandardizabilityController } from './standardizability.controller.js'
import { StandardizabilityStatusService } from './standardizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [StandardizabilityController],
  providers: [StandardizabilityStatusService, StandardizabilityAdminService],
  exports: [StandardizabilityAdminService],
})
export class StandardizabilityModule {}
