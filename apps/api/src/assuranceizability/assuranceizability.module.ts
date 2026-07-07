import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AssuranceizabilityAdminService } from './assuranceizability-admin.service.js'
import { AssuranceizabilityController } from './assuranceizability.controller.js'
import { AssuranceizabilityStatusService } from './assuranceizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AssuranceizabilityController],
  providers: [AssuranceizabilityStatusService, AssuranceizabilityAdminService],
  exports: [AssuranceizabilityAdminService],
})
export class AssuranceizabilityModule {}
