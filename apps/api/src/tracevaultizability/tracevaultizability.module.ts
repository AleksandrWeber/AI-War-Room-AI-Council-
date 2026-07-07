import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TracevaultizabilityAdminService } from './tracevaultizability-admin.service.js'
import { TracevaultizabilityController } from './tracevaultizability.controller.js'
import { TracevaultizabilityStatusService } from './tracevaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TracevaultizabilityController],
  providers: [TracevaultizabilityStatusService, TracevaultizabilityAdminService],
  exports: [TracevaultizabilityAdminService],
})
export class TracevaultizabilityModule {}
