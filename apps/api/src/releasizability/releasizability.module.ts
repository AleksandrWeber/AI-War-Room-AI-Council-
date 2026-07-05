import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReleasizabilityAdminService } from './releasizability-admin.service.js'
import { ReleasizabilityController } from './releasizability.controller.js'
import { ReleasizabilityStatusService } from './releasizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReleasizabilityController],
  providers: [ReleasizabilityStatusService, ReleasizabilityAdminService],
  exports: [ReleasizabilityAdminService],
})
export class ReleasizabilityModule {}
