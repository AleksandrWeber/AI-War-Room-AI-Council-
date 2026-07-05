import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PortabilityAdminService } from './portability-admin.service.js'
import { PortabilityController } from './portability.controller.js'
import { PortabilityStatusService } from './portability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PortabilityController],
  providers: [PortabilityStatusService, PortabilityAdminService],
  exports: [PortabilityAdminService],
})
export class PortabilityModule {}
