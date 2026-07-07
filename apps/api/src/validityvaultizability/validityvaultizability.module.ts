import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ValidityvaultizabilityAdminService } from './validityvaultizability-admin.service.js'
import { ValidityvaultizabilityController } from './validityvaultizability.controller.js'
import { ValidityvaultizabilityStatusService } from './validityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ValidityvaultizabilityController],
  providers: [ValidityvaultizabilityStatusService, ValidityvaultizabilityAdminService],
  exports: [ValidityvaultizabilityAdminService],
})
export class ValidityvaultizabilityModule {}
