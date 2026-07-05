import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DirectoryizabilityAdminService } from './directoryizability-admin.service.js'
import { DirectoryizabilityController } from './directoryizability.controller.js'
import { DirectoryizabilityStatusService } from './directoryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DirectoryizabilityController],
  providers: [DirectoryizabilityStatusService, DirectoryizabilityAdminService],
  exports: [DirectoryizabilityAdminService],
})
export class DirectoryizabilityModule {}
