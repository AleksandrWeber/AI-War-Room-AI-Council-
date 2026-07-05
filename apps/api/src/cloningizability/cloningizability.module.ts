import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CloningizabilityAdminService } from './cloningizability-admin.service.js'
import { CloningizabilityController } from './cloningizability.controller.js'
import { CloningizabilityStatusService } from './cloningizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CloningizabilityController],
  providers: [CloningizabilityStatusService, CloningizabilityAdminService],
  exports: [CloningizabilityAdminService],
})
export class CloningizabilityModule {}
