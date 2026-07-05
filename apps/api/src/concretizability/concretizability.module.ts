import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConcretizabilityAdminService } from './concretizability-admin.service.js'
import { ConcretizabilityController } from './concretizability.controller.js'
import { ConcretizabilityStatusService } from './concretizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConcretizabilityController],
  providers: [ConcretizabilityStatusService, ConcretizabilityAdminService],
  exports: [ConcretizabilityAdminService],
})
export class ConcretizabilityModule {}
