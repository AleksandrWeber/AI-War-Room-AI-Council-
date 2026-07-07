import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuditjournalizabilityAdminService } from './auditjournalizability-admin.service.js'
import { AuditjournalizabilityController } from './auditjournalizability.controller.js'
import { AuditjournalizabilityStatusService } from './auditjournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuditjournalizabilityController],
  providers: [AuditjournalizabilityStatusService, AuditjournalizabilityAdminService],
  exports: [AuditjournalizabilityAdminService],
})
export class AuditjournalizabilityModule {}
