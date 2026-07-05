import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SurvivabilityAdminService } from './survivability-admin.service.js'
import { SurvivabilityController } from './survivability.controller.js'
import { SurvivabilityStatusService } from './survivability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SurvivabilityController],
  providers: [SurvivabilityStatusService, SurvivabilityAdminService],
  exports: [SurvivabilityAdminService],
})
export class SurvivabilityModule {}
