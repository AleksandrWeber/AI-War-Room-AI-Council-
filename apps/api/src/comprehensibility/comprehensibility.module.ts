import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ComprehensibilityAdminService } from './comprehensibility-admin.service.js'
import { ComprehensibilityController } from './comprehensibility.controller.js'
import { ComprehensibilityStatusService } from './comprehensibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ComprehensibilityController],
  providers: [ComprehensibilityStatusService, ComprehensibilityAdminService],
  exports: [ComprehensibilityAdminService],
})
export class ComprehensibilityModule {}
