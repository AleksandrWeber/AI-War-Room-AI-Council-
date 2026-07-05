import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CalibratizabilityAdminService } from './calibratizability-admin.service.js'
import { CalibratizabilityController } from './calibratizability.controller.js'
import { CalibratizabilityStatusService } from './calibratizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CalibratizabilityController],
  providers: [CalibratizabilityStatusService, CalibratizabilityAdminService],
  exports: [CalibratizabilityAdminService],
})
export class CalibratizabilityModule {}
