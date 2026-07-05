import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ExtrapolizabilityAdminService } from './extrapolizability-admin.service.js'
import { ExtrapolizabilityController } from './extrapolizability.controller.js'
import { ExtrapolizabilityStatusService } from './extrapolizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ExtrapolizabilityController],
  providers: [ExtrapolizabilityStatusService, ExtrapolizabilityAdminService],
  exports: [ExtrapolizabilityAdminService],
})
export class ExtrapolizabilityModule {}
