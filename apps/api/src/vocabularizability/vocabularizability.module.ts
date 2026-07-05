import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { VocabularizabilityAdminService } from './vocabularizability-admin.service.js'
import { VocabularizabilityController } from './vocabularizability.controller.js'
import { VocabularizabilityStatusService } from './vocabularizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [VocabularizabilityController],
  providers: [VocabularizabilityStatusService, VocabularizabilityAdminService],
  exports: [VocabularizabilityAdminService],
})
export class VocabularizabilityModule {}
