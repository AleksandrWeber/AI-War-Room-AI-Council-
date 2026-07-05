import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComplianceAdminService } from './compliance-admin.service.js'
import { ComplianceController } from './compliance.controller.js'
import { ComplianceStatusService } from './compliance-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComplianceController],
  providers: [ComplianceStatusService, ComplianceAdminService],
  exports: [ComplianceAdminService],
})
export class ComplianceModule {}
