import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RepeatabilityvaultizabilityAdminService } from './repeatabilityvaultizability-admin.service.js'
import { RepeatabilityvaultizabilityController } from './repeatabilityvaultizability.controller.js'
import { RepeatabilityvaultizabilityStatusService } from './repeatabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RepeatabilityvaultizabilityController],
  providers: [RepeatabilityvaultizabilityStatusService, RepeatabilityvaultizabilityAdminService],
  exports: [RepeatabilityvaultizabilityAdminService],
})
export class RepeatabilityvaultizabilityModule {}
