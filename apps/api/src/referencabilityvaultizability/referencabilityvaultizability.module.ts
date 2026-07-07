import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReferencabilityvaultizabilityAdminService } from './referencabilityvaultizability-admin.service.js'
import { ReferencabilityvaultizabilityController } from './referencabilityvaultizability.controller.js'
import { ReferencabilityvaultizabilityStatusService } from './referencabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReferencabilityvaultizabilityController],
  providers: [ReferencabilityvaultizabilityStatusService, ReferencabilityvaultizabilityAdminService],
  exports: [ReferencabilityvaultizabilityAdminService],
})
export class ReferencabilityvaultizabilityModule {}
