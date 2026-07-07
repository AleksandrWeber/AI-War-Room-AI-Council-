import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AudittrailizabilityAdminService } from './audittrailizability-admin.service.js'
import { AudittrailizabilityController } from './audittrailizability.controller.js'
import { AudittrailizabilityStatusService } from './audittrailizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AudittrailizabilityController],
  providers: [AudittrailizabilityStatusService, AudittrailizabilityAdminService],
  exports: [AudittrailizabilityAdminService],
})
export class AudittrailizabilityModule {}
