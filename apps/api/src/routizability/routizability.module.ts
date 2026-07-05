import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RoutizabilityAdminService } from './routizability-admin.service.js'
import { RoutizabilityController } from './routizability.controller.js'
import { RoutizabilityStatusService } from './routizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RoutizabilityController],
  providers: [RoutizabilityStatusService, RoutizabilityAdminService],
  exports: [RoutizabilityAdminService],
})
export class RoutizabilityModule {}
