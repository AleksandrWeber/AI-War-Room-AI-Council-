import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AccessibilityAdminService } from './accessibility-admin.service.js'
import { AccessibilityController } from './accessibility.controller.js'
import { AccessibilityStatusService } from './accessibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AccessibilityController],
  providers: [AccessibilityStatusService, AccessibilityAdminService],
  exports: [AccessibilityAdminService],
})
export class AccessibilityModule {}
