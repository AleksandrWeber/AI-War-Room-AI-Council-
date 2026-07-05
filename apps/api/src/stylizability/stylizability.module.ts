import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { StylizabilityAdminService } from './stylizability-admin.service.js'
import { StylizabilityController } from './stylizability.controller.js'
import { StylizabilityStatusService } from './stylizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [StylizabilityController],
  providers: [StylizabilityStatusService, StylizabilityAdminService],
  exports: [StylizabilityAdminService],
})
export class StylizabilityModule {}
