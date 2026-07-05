import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PatchizabilityAdminService } from './patchizability-admin.service.js'
import { PatchizabilityController } from './patchizability.controller.js'
import { PatchizabilityStatusService } from './patchizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PatchizabilityController],
  providers: [PatchizabilityStatusService, PatchizabilityAdminService],
  exports: [PatchizabilityAdminService],
})
export class PatchizabilityModule {}
