import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PivotizabilityAdminService } from './pivotizability-admin.service.js'
import { PivotizabilityController } from './pivotizability.controller.js'
import { PivotizabilityStatusService } from './pivotizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PivotizabilityController],
  providers: [PivotizabilityStatusService, PivotizabilityAdminService],
  exports: [PivotizabilityAdminService],
})
export class PivotizabilityModule {}
