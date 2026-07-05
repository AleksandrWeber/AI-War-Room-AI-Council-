import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CompressizabilityAdminService } from './compressizability-admin.service.js'
import { CompressizabilityController } from './compressizability.controller.js'
import { CompressizabilityStatusService } from './compressizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CompressizabilityController],
  providers: [CompressizabilityStatusService, CompressizabilityAdminService],
  exports: [CompressizabilityAdminService],
})
export class CompressizabilityModule {}
