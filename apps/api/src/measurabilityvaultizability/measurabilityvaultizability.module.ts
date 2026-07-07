import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MeasurabilityvaultizabilityAdminService } from './measurabilityvaultizability-admin.service.js'
import { MeasurabilityvaultizabilityController } from './measurabilityvaultizability.controller.js'
import { MeasurabilityvaultizabilityStatusService } from './measurabilityvaultizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MeasurabilityvaultizabilityController],
  providers: [MeasurabilityvaultizabilityStatusService, MeasurabilityvaultizabilityAdminService],
  exports: [MeasurabilityvaultizabilityAdminService],
})
export class MeasurabilityvaultizabilityModule {}
