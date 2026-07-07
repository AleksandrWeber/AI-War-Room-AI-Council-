import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TraceledgerizabilityAdminService } from './traceledgerizability-admin.service.js'
import { TraceledgerizabilityController } from './traceledgerizability.controller.js'
import { TraceledgerizabilityStatusService } from './traceledgerizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TraceledgerizabilityController],
  providers: [TraceledgerizabilityStatusService, TraceledgerizabilityAdminService],
  exports: [TraceledgerizabilityAdminService],
})
export class TraceledgerizabilityModule {}
