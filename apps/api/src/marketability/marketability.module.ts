import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MarketabilityAdminService } from './marketability-admin.service.js'
import { MarketabilityController } from './marketability.controller.js'
import { MarketabilityStatusService } from './marketability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MarketabilityController],
  providers: [MarketabilityStatusService, MarketabilityAdminService],
  exports: [MarketabilityAdminService],
})
export class MarketabilityModule {}
