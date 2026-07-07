import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProvenancevaultizabilityAdminService } from './provenancevaultizability-admin.service.js'
import { ProvenancevaultizabilityController } from './provenancevaultizability.controller.js'
import { ProvenancevaultizabilityStatusService } from './provenancevaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProvenancevaultizabilityController],
  providers: [ProvenancevaultizabilityStatusService, ProvenancevaultizabilityAdminService],
  exports: [ProvenancevaultizabilityAdminService],
})
export class ProvenancevaultizabilityModule {}
