import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { VersioningizabilityAdminService } from './versioningizability-admin.service.js'
import { VersioningizabilityController } from './versioningizability.controller.js'
import { VersioningizabilityStatusService } from './versioningizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [VersioningizabilityController],
  providers: [VersioningizabilityStatusService, VersioningizabilityAdminService],
  exports: [VersioningizabilityAdminService],
})
export class VersioningizabilityModule {}
