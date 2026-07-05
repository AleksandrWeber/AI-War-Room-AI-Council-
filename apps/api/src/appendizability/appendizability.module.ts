import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AppendizabilityAdminService } from './appendizability-admin.service.js'
import { AppendizabilityController } from './appendizability.controller.js'
import { AppendizabilityStatusService } from './appendizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AppendizabilityController],
  providers: [AppendizabilityStatusService, AppendizabilityAdminService],
  exports: [AppendizabilityAdminService],
})
export class AppendizabilityModule {}
