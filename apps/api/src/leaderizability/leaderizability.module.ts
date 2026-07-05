import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LeaderizabilityAdminService } from './leaderizability-admin.service.js'
import { LeaderizabilityController } from './leaderizability.controller.js'
import { LeaderizabilityStatusService } from './leaderizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LeaderizabilityController],
  providers: [LeaderizabilityStatusService, LeaderizabilityAdminService],
  exports: [LeaderizabilityAdminService],
})
export class LeaderizabilityModule {}
