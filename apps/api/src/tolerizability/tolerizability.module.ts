import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TolerizabilityAdminService } from './tolerizability-admin.service.js'
import { TolerizabilityController } from './tolerizability.controller.js'
import { TolerizabilityStatusService } from './tolerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TolerizabilityController],
  providers: [TolerizabilityStatusService, TolerizabilityAdminService],
  exports: [TolerizabilityAdminService],
})
export class TolerizabilityModule {}
