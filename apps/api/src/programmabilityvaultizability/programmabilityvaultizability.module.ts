import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProgrammabilityvaultizabilityAdminService } from './programmabilityvaultizability-admin.service.js'
import { ProgrammabilityvaultizabilityController } from './programmabilityvaultizability.controller.js'
import { ProgrammabilityvaultizabilityStatusService } from './programmabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProgrammabilityvaultizabilityController],
  providers: [ProgrammabilityvaultizabilityStatusService, ProgrammabilityvaultizabilityAdminService],
  exports: [ProgrammabilityvaultizabilityAdminService],
})
export class ProgrammabilityvaultizabilityModule {}
