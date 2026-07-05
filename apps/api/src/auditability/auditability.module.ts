import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuditabilityAdminService } from './auditability-admin.service.js'
import { AuditabilityController } from './auditability.controller.js'
import { AuditabilityStatusService } from './auditability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuditabilityController],
  providers: [AuditabilityStatusService, AuditabilityAdminService],
  exports: [AuditabilityAdminService],
})
export class AuditabilityModule {}
