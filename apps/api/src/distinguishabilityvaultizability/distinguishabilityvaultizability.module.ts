import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DistinguishabilityvaultizabilityAdminService } from './distinguishabilityvaultizability-admin.service.js'
import { DistinguishabilityvaultizabilityController } from './distinguishabilityvaultizability.controller.js'
import { DistinguishabilityvaultizabilityStatusService } from './distinguishabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DistinguishabilityvaultizabilityController],
  providers: [DistinguishabilityvaultizabilityStatusService, DistinguishabilityvaultizabilityAdminService],
  exports: [DistinguishabilityvaultizabilityAdminService],
})
export class DistinguishabilityvaultizabilityModule {}
