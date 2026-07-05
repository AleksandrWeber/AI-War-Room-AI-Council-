import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { OntologizabilityAdminService } from './ontologizability-admin.service.js'
import { OntologizabilityController } from './ontologizability.controller.js'
import { OntologizabilityStatusService } from './ontologizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [OntologizabilityController],
  providers: [OntologizabilityStatusService, OntologizabilityAdminService],
  exports: [OntologizabilityAdminService],
})
export class OntologizabilityModule {}
