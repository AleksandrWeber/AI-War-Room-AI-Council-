import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MigratizabilityAdminService } from './migratizability-admin.service.js'
import { MigratizabilityController } from './migratizability.controller.js'
import { MigratizabilityStatusService } from './migratizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MigratizabilityController],
  providers: [MigratizabilityStatusService, MigratizabilityAdminService],
  exports: [MigratizabilityAdminService],
})
export class MigratizabilityModule {}
