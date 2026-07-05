import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RetentionizabilityAdminService } from './retentionizability-admin.service.js'
import { RetentionizabilityController } from './retentionizability.controller.js'
import { RetentionizabilityStatusService } from './retentionizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RetentionizabilityController],
  providers: [RetentionizabilityStatusService, RetentionizabilityAdminService],
  exports: [RetentionizabilityAdminService],
})
export class RetentionizabilityModule {}
