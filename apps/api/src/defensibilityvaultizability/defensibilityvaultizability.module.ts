import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DefensibilityvaultizabilityAdminService } from './defensibilityvaultizability-admin.service.js'
import { DefensibilityvaultizabilityController } from './defensibilityvaultizability.controller.js'
import { DefensibilityvaultizabilityStatusService } from './defensibilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DefensibilityvaultizabilityController],
  providers: [DefensibilityvaultizabilityStatusService, DefensibilityvaultizabilityAdminService],
  exports: [DefensibilityvaultizabilityAdminService],
})
export class DefensibilityvaultizabilityModule {}
