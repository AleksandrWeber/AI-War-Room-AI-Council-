import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FamiliarityAdminService } from './familiarity-admin.service.js'
import { FamiliarityController } from './familiarity.controller.js'
import { FamiliarityStatusService } from './familiarity-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FamiliarityController],
  providers: [FamiliarityStatusService, FamiliarityAdminService],
  exports: [FamiliarityAdminService],
})
export class FamiliarityModule {}
