import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InterchangeabilityvaultizabilityAdminService } from './interchangeabilityvaultizability-admin.service.js'
import { InterchangeabilityvaultizabilityController } from './interchangeabilityvaultizability.controller.js'
import { InterchangeabilityvaultizabilityStatusService } from './interchangeabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InterchangeabilityvaultizabilityController],
  providers: [InterchangeabilityvaultizabilityStatusService, InterchangeabilityvaultizabilityAdminService],
  exports: [InterchangeabilityvaultizabilityAdminService],
})
export class InterchangeabilityvaultizabilityModule {}
