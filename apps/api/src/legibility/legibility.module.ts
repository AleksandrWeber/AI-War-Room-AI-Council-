import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LegibilityAdminService } from './legibility-admin.service.js'
import { LegibilityController } from './legibility.controller.js'
import { LegibilityStatusService } from './legibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LegibilityController],
  providers: [LegibilityStatusService, LegibilityAdminService],
  exports: [LegibilityAdminService],
})
export class LegibilityModule {}
