import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AttestledgerizabilityAdminService } from './attestledgerizability-admin.service.js'
import { AttestledgerizabilityController } from './attestledgerizability.controller.js'
import { AttestledgerizabilityStatusService } from './attestledgerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AttestledgerizabilityController],
  providers: [AttestledgerizabilityStatusService, AttestledgerizabilityAdminService],
  exports: [AttestledgerizabilityAdminService],
})
export class AttestledgerizabilityModule {}
