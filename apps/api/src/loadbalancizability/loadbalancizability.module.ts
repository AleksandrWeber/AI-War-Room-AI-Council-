import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LoadbalancizabilityAdminService } from './loadbalancizability-admin.service.js'
import { LoadbalancizabilityController } from './loadbalancizability.controller.js'
import { LoadbalancizabilityStatusService } from './loadbalancizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LoadbalancizabilityController],
  providers: [LoadbalancizabilityStatusService, LoadbalancizabilityAdminService],
  exports: [LoadbalancizabilityAdminService],
})
export class LoadbalancizabilityModule {}
