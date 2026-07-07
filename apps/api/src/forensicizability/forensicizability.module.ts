import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ForensicizabilityAdminService } from './forensicizability-admin.service.js'
import { ForensicizabilityController } from './forensicizability.controller.js'
import { ForensicizabilityStatusService } from './forensicizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ForensicizabilityController],
  providers: [ForensicizabilityStatusService, ForensicizabilityAdminService],
  exports: [ForensicizabilityAdminService],
})
export class ForensicizabilityModule {}
