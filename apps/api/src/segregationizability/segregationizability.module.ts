import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SegregationizabilityAdminService } from './segregationizability-admin.service.js'
import { SegregationizabilityController } from './segregationizability.controller.js'
import { SegregationizabilityStatusService } from './segregationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SegregationizabilityController],
  providers: [SegregationizabilityStatusService, SegregationizabilityAdminService],
  exports: [SegregationizabilityAdminService],
})
export class SegregationizabilityModule {}
