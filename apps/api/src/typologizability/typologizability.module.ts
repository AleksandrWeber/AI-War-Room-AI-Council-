import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TypologizabilityAdminService } from './typologizability-admin.service.js'
import { TypologizabilityController } from './typologizability.controller.js'
import { TypologizabilityStatusService } from './typologizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TypologizabilityController],
  providers: [TypologizabilityStatusService, TypologizabilityAdminService],
  exports: [TypologizabilityAdminService],
})
export class TypologizabilityModule {}
