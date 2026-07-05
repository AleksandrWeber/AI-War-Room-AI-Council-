import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ParabolizabilityAdminService } from './parabolizability-admin.service.js'
import { ParabolizabilityController } from './parabolizability.controller.js'
import { ParabolizabilityStatusService } from './parabolizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ParabolizabilityController],
  providers: [ParabolizabilityStatusService, ParabolizabilityAdminService],
  exports: [ParabolizabilityAdminService],
})
export class ParabolizabilityModule {}
