import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TraceabilizabilityAdminService } from './traceabilizability-admin.service.js'
import { TraceabilizabilityController } from './traceabilizability.controller.js'
import { TraceabilizabilityStatusService } from './traceabilizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TraceabilizabilityController],
  providers: [TraceabilizabilityStatusService, TraceabilizabilityAdminService],
  exports: [TraceabilizabilityAdminService],
})
export class TraceabilizabilityModule {}
