import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AdoptabilityAdminService } from './adoptability-admin.service.js'
import { AdoptabilityController } from './adoptability.controller.js'
import { AdoptabilityStatusService } from './adoptability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AdoptabilityController],
  providers: [AdoptabilityStatusService, AdoptabilityAdminService],
  exports: [AdoptabilityAdminService],
})
export class AdoptabilityModule {}
