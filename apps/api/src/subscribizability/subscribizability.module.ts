import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SubscribizabilityAdminService } from './subscribizability-admin.service.js'
import { SubscribizabilityController } from './subscribizability.controller.js'
import { SubscribizabilityStatusService } from './subscribizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SubscribizabilityController],
  providers: [SubscribizabilityStatusService, SubscribizabilityAdminService],
  exports: [SubscribizabilityAdminService],
})
export class SubscribizabilityModule {}
