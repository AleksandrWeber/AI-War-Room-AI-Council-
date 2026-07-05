import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReduceizabilityAdminService } from './reduceizability-admin.service.js'
import { ReduceizabilityController } from './reduceizability.controller.js'
import { ReduceizabilityStatusService } from './reduceizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReduceizabilityController],
  providers: [ReduceizabilityStatusService, ReduceizabilityAdminService],
  exports: [ReduceizabilityAdminService],
})
export class ReduceizabilityModule {}
