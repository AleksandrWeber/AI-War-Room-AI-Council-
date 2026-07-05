import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SortizabilityAdminService } from './sortizability-admin.service.js'
import { SortizabilityController } from './sortizability.controller.js'
import { SortizabilityStatusService } from './sortizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SortizabilityController],
  providers: [SortizabilityStatusService, SortizabilityAdminService],
  exports: [SortizabilityAdminService],
})
export class SortizabilityModule {}
