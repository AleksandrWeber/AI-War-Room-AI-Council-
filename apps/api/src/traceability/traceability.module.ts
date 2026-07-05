import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TraceabilityAdminService } from './traceability-admin.service.js'
import { TraceabilityController } from './traceability.controller.js'
import { TraceabilityStatusService } from './traceability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TraceabilityController],
  providers: [TraceabilityStatusService, TraceabilityAdminService],
  exports: [TraceabilityAdminService],
})
export class TraceabilityModule {}
