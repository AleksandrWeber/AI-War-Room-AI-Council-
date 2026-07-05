import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CaracterizabilityAdminService } from './caracterizability-admin.service.js'
import { CaracterizabilityController } from './caracterizability.controller.js'
import { CaracterizabilityStatusService } from './caracterizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CaracterizabilityController],
  providers: [CaracterizabilityStatusService, CaracterizabilityAdminService],
  exports: [CaracterizabilityAdminService],
})
export class CaracterizabilityModule {}
