import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MeasurabilityAdminService } from './measurability-admin.service.js'
import { MeasurabilityController } from './measurability.controller.js'
import { MeasurabilityStatusService } from './measurability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MeasurabilityController],
  providers: [MeasurabilityStatusService, MeasurabilityAdminService],
  exports: [MeasurabilityAdminService],
})
export class MeasurabilityModule {}
