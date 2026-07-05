import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DefensibilityAdminService } from './defensibility-admin.service.js'
import { DefensibilityController } from './defensibility.controller.js'
import { DefensibilityStatusService } from './defensibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DefensibilityController],
  providers: [DefensibilityStatusService, DefensibilityAdminService],
  exports: [DefensibilityAdminService],
})
export class DefensibilityModule {}
