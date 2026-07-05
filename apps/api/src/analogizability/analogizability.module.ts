import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AnalogizabilityAdminService } from './analogizability-admin.service.js'
import { AnalogizabilityController } from './analogizability.controller.js'
import { AnalogizabilityStatusService } from './analogizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AnalogizabilityController],
  providers: [AnalogizabilityStatusService, AnalogizabilityAdminService],
  exports: [AnalogizabilityAdminService],
})
export class AnalogizabilityModule {}
