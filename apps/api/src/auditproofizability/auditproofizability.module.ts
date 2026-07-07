import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuditproofizabilityAdminService } from './auditproofizability-admin.service.js'
import { AuditproofizabilityController } from './auditproofizability.controller.js'
import { AuditproofizabilityStatusService } from './auditproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuditproofizabilityController],
  providers: [AuditproofizabilityStatusService, AuditproofizabilityAdminService],
  exports: [AuditproofizabilityAdminService],
})
export class AuditproofizabilityModule {}
