import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuditlineizabilityAdminService } from './auditlineizability-admin.service.js'
import { AuditlineizabilityController } from './auditlineizability.controller.js'
import { AuditlineizabilityStatusService } from './auditlineizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuditlineizabilityController],
  providers: [AuditlineizabilityStatusService, AuditlineizabilityAdminService],
  exports: [AuditlineizabilityAdminService],
})
export class AuditlineizabilityModule {}
