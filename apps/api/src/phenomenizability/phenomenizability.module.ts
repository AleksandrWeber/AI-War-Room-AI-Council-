import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PhenomenizabilityAdminService } from './phenomenizability-admin.service.js'
import { PhenomenizabilityController } from './phenomenizability.controller.js'
import { PhenomenizabilityStatusService } from './phenomenizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PhenomenizabilityController],
  providers: [PhenomenizabilityStatusService, PhenomenizabilityAdminService],
  exports: [PhenomenizabilityAdminService],
})
export class PhenomenizabilityModule {}
