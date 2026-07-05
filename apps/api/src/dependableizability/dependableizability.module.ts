import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DependableizabilityAdminService } from './dependableizability-admin.service.js'
import { DependableizabilityController } from './dependableizability.controller.js'
import { DependableizabilityStatusService } from './dependableizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DependableizabilityController],
  providers: [DependableizabilityStatusService, DependableizabilityAdminService],
  exports: [DependableizabilityAdminService],
})
export class DependableizabilityModule {}
