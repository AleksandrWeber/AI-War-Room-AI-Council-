import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ScanizabilityAdminService } from './scanizability-admin.service.js'
import { ScanizabilityController } from './scanizability.controller.js'
import { ScanizabilityStatusService } from './scanizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ScanizabilityController],
  providers: [ScanizabilityStatusService, ScanizabilityAdminService],
  exports: [ScanizabilityAdminService],
})
export class ScanizabilityModule {}
