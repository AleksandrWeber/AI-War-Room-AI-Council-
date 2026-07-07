import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NotarledgerizabilityAdminService } from './notarledgerizability-admin.service.js'
import { NotarledgerizabilityController } from './notarledgerizability.controller.js'
import { NotarledgerizabilityStatusService } from './notarledgerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NotarledgerizabilityController],
  providers: [NotarledgerizabilityStatusService, NotarledgerizabilityAdminService],
  exports: [NotarledgerizabilityAdminService],
})
export class NotarledgerizabilityModule {}
