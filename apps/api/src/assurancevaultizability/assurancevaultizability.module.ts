import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AssurancevaultizabilityAdminService } from './assurancevaultizability-admin.service.js'
import { AssurancevaultizabilityController } from './assurancevaultizability.controller.js'
import { AssurancevaultizabilityStatusService } from './assurancevaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AssurancevaultizabilityController],
  providers: [AssurancevaultizabilityStatusService, AssurancevaultizabilityAdminService],
  exports: [AssurancevaultizabilityAdminService],
})
export class AssurancevaultizabilityModule {}
