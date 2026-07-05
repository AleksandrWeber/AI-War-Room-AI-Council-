import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComposabilizabilityAdminService } from './composabilizability-admin.service.js'
import { ComposabilizabilityController } from './composabilizability.controller.js'
import { ComposabilizabilityStatusService } from './composabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComposabilizabilityController],
  providers: [ComposabilizabilityStatusService, ComposabilizabilityAdminService],
  exports: [ComposabilizabilityAdminService],
})
export class ComposabilizabilityModule {}
