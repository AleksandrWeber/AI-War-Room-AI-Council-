import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DescribabilityAdminService } from './describability-admin.service.js'
import { DescribabilityController } from './describability.controller.js'
import { DescribabilityStatusService } from './describability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DescribabilityController],
  providers: [DescribabilityStatusService, DescribabilityAdminService],
  exports: [DescribabilityAdminService],
})
export class DescribabilityModule {}
