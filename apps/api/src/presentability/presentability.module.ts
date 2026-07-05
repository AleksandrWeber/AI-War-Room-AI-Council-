import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { PresentabilityAdminService } from './presentability-admin.service.js'
import { PresentabilityController } from './presentability.controller.js'
import { PresentabilityStatusService } from './presentability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [PresentabilityController],
  providers: [PresentabilityStatusService, PresentabilityAdminService],
  exports: [PresentabilityAdminService],
})
export class PresentabilityModule {}
