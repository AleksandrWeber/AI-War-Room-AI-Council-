import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ModifiabilityAdminService } from './modifiability-admin.service.js'
import { ModifiabilityController } from './modifiability.controller.js'
import { ModifiabilityStatusService } from './modifiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ModifiabilityController],
  providers: [ModifiabilityStatusService, ModifiabilityAdminService],
  exports: [ModifiabilityAdminService],
})
export class ModifiabilityModule {}
