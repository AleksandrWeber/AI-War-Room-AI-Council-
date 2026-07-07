import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AdjustabilityvaultizabilityAdminService } from './adjustabilityvaultizability-admin.service.js'
import { AdjustabilityvaultizabilityController } from './adjustabilityvaultizability.controller.js'
import { AdjustabilityvaultizabilityStatusService } from './adjustabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AdjustabilityvaultizabilityController],
  providers: [AdjustabilityvaultizabilityStatusService, AdjustabilityvaultizabilityAdminService],
  exports: [AdjustabilityvaultizabilityAdminService],
})
export class AdjustabilityvaultizabilityModule {}
