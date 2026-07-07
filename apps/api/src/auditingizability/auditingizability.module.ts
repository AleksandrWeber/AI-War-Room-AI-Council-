import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuditingizabilityAdminService } from './auditingizability-admin.service.js'
import { AuditingizabilityController } from './auditingizability.controller.js'
import { AuditingizabilityStatusService } from './auditingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuditingizabilityController],
  providers: [AuditingizabilityStatusService, AuditingizabilityAdminService],
  exports: [AuditingizabilityAdminService],
})
export class AuditingizabilityModule {}
