import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AccesscontrolizabilityAdminService } from './accesscontrolizability-admin.service.js'
import { AccesscontrolizabilityController } from './accesscontrolizability.controller.js'
import { AccesscontrolizabilityStatusService } from './accesscontrolizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AccesscontrolizabilityController],
  providers: [AccesscontrolizabilityStatusService, AccesscontrolizabilityAdminService],
  exports: [AccesscontrolizabilityAdminService],
})
export class AccesscontrolizabilityModule {}
