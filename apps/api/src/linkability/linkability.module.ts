import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LinkabilityAdminService } from './linkability-admin.service.js'
import { LinkabilityController } from './linkability.controller.js'
import { LinkabilityStatusService } from './linkability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LinkabilityController],
  providers: [LinkabilityStatusService, LinkabilityAdminService],
  exports: [LinkabilityAdminService],
})
export class LinkabilityModule {}
