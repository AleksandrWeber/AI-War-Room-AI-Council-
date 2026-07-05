import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProfitabilityAdminService } from './profitability-admin.service.js'
import { ProfitabilityController } from './profitability.controller.js'
import { ProfitabilityStatusService } from './profitability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProfitabilityController],
  providers: [ProfitabilityStatusService, ProfitabilityAdminService],
  exports: [ProfitabilityAdminService],
})
export class ProfitabilityModule {}
