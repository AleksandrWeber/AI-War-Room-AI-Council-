import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuditabilityvaultizabilityAdminService } from './auditabilityvaultizability-admin.service.js'
import { AuditabilityvaultizabilityController } from './auditabilityvaultizability.controller.js'
import { AuditabilityvaultizabilityStatusService } from './auditabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuditabilityvaultizabilityController],
  providers: [AuditabilityvaultizabilityStatusService, AuditabilityvaultizabilityAdminService],
  exports: [AuditabilityvaultizabilityAdminService],
})
export class AuditabilityvaultizabilityModule {}
