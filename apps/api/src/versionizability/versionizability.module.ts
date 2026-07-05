import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { VersionizabilityAdminService } from './versionizability-admin.service.js'
import { VersionizabilityController } from './versionizability.controller.js'
import { VersionizabilityStatusService } from './versionizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [VersionizabilityController],
  providers: [VersionizabilityStatusService, VersionizabilityAdminService],
  exports: [VersionizabilityAdminService],
})
export class VersionizabilityModule {}
