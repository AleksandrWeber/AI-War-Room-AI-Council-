import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuditAdminService } from './audit-admin.service.js'
import { AuditController } from './audit.controller.js'
import { AuditStatusService } from './audit-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuditController],
  providers: [AuditStatusService, AuditAdminService],
  exports: [AuditAdminService],
})
export class AuditModule {}
