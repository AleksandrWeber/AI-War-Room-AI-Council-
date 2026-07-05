import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RetryizabilityAdminService } from './retryizability-admin.service.js'
import { RetryizabilityController } from './retryizability.controller.js'
import { RetryizabilityStatusService } from './retryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RetryizabilityController],
  providers: [RetryizabilityStatusService, RetryizabilityAdminService],
  exports: [RetryizabilityAdminService],
})
export class RetryizabilityModule {}
