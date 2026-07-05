import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DiscernibilityAdminService } from './discernibility-admin.service.js'
import { DiscernibilityController } from './discernibility.controller.js'
import { DiscernibilityStatusService } from './discernibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DiscernibilityController],
  providers: [DiscernibilityStatusService, DiscernibilityAdminService],
  exports: [DiscernibilityAdminService],
})
export class DiscernibilityModule {}
