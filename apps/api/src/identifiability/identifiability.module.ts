import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IdentifiabilityAdminService } from './identifiability-admin.service.js'
import { IdentifiabilityController } from './identifiability.controller.js'
import { IdentifiabilityStatusService } from './identifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IdentifiabilityController],
  providers: [IdentifiabilityStatusService, IdentifiabilityAdminService],
  exports: [IdentifiabilityAdminService],
})
export class IdentifiabilityModule {}
