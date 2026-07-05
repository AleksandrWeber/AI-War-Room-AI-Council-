import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComposabilityAdminService } from './composability-admin.service.js'
import { ComposabilityController } from './composability.controller.js'
import { ComposabilityStatusService } from './composability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComposabilityController],
  providers: [ComposabilityStatusService, ComposabilityAdminService],
  exports: [ComposabilityAdminService],
})
export class ComposabilityModule {}
