import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TraceproofizabilityAdminService } from './traceproofizability-admin.service.js'
import { TraceproofizabilityController } from './traceproofizability.controller.js'
import { TraceproofizabilityStatusService } from './traceproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TraceproofizabilityController],
  providers: [TraceproofizabilityStatusService, TraceproofizabilityAdminService],
  exports: [TraceproofizabilityAdminService],
})
export class TraceproofizabilityModule {}
