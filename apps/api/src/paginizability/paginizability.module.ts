import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PaginizabilityAdminService } from './paginizability-admin.service.js'
import { PaginizabilityController } from './paginizability.controller.js'
import { PaginizabilityStatusService } from './paginizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PaginizabilityController],
  providers: [PaginizabilityStatusService, PaginizabilityAdminService],
  exports: [PaginizabilityAdminService],
})
export class PaginizabilityModule {}
