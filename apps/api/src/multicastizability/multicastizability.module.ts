import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MulticastizabilityAdminService } from './multicastizability-admin.service.js'
import { MulticastizabilityController } from './multicastizability.controller.js'
import { MulticastizabilityStatusService } from './multicastizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MulticastizabilityController],
  providers: [MulticastizabilityStatusService, MulticastizabilityAdminService],
  exports: [MulticastizabilityAdminService],
})
export class MulticastizabilityModule {}
