import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ScalabilityAdminService } from './scalability-admin.service.js'
import { ScalabilityController } from './scalability.controller.js'
import { ScalabilityStatusService } from './scalability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ScalabilityController],
  providers: [ScalabilityStatusService, ScalabilityAdminService],
  exports: [ScalabilityAdminService],
})
export class ScalabilityModule {}
