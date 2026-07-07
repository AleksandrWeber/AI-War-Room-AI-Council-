import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AuthenticityvaultizabilityAdminService } from './authenticityvaultizability-admin.service.js'
import { AuthenticityvaultizabilityController } from './authenticityvaultizability.controller.js'
import { AuthenticityvaultizabilityStatusService } from './authenticityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AuthenticityvaultizabilityController],
  providers: [AuthenticityvaultizabilityStatusService, AuthenticityvaultizabilityAdminService],
  exports: [AuthenticityvaultizabilityAdminService],
})
export class AuthenticityvaultizabilityModule {}
