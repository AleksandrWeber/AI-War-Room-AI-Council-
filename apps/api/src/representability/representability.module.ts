import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RepresentabilityAdminService } from './representability-admin.service.js'
import { RepresentabilityController } from './representability.controller.js'
import { RepresentabilityStatusService } from './representability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RepresentabilityController],
  providers: [RepresentabilityStatusService, RepresentabilityAdminService],
  exports: [RepresentabilityAdminService],
})
export class RepresentabilityModule {}
