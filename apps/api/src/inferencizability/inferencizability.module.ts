import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InferencizabilityAdminService } from './inferencizability-admin.service.js'
import { InferencizabilityController } from './inferencizability.controller.js'
import { InferencizabilityStatusService } from './inferencizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InferencizabilityController],
  providers: [InferencizabilityStatusService, InferencizabilityAdminService],
  exports: [InferencizabilityAdminService],
})
export class InferencizabilityModule {}
