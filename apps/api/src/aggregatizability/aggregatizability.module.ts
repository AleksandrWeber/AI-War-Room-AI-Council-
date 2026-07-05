import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AggregatizabilityAdminService } from './aggregatizability-admin.service.js'
import { AggregatizabilityController } from './aggregatizability.controller.js'
import { AggregatizabilityStatusService } from './aggregatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AggregatizabilityController],
  providers: [AggregatizabilityStatusService, AggregatizabilityAdminService],
  exports: [AggregatizabilityAdminService],
})
export class AggregatizabilityModule {}
