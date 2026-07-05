import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PragmatizabilityAdminService } from './pragmatizability-admin.service.js'
import { PragmatizabilityController } from './pragmatizability.controller.js'
import { PragmatizabilityStatusService } from './pragmatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PragmatizabilityController],
  providers: [PragmatizabilityStatusService, PragmatizabilityAdminService],
  exports: [PragmatizabilityAdminService],
})
export class PragmatizabilityModule {}
