import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InvalidationizabilityAdminService } from './invalidationizability-admin.service.js'
import { InvalidationizabilityController } from './invalidationizability.controller.js'
import { InvalidationizabilityStatusService } from './invalidationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InvalidationizabilityController],
  providers: [InvalidationizabilityStatusService, InvalidationizabilityAdminService],
  exports: [InvalidationizabilityAdminService],
})
export class InvalidationizabilityModule {}
