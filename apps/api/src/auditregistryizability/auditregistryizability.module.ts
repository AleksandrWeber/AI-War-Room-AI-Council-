import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuditregistryizabilityAdminService } from './auditregistryizability-admin.service.js'
import { AuditregistryizabilityController } from './auditregistryizability.controller.js'
import { AuditregistryizabilityStatusService } from './auditregistryizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuditregistryizabilityController],
  providers: [AuditregistryizabilityStatusService, AuditregistryizabilityAdminService],
  exports: [AuditregistryizabilityAdminService],
})
export class AuditregistryizabilityModule {}
