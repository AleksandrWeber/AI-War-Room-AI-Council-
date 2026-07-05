import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CategorizabilityAdminService } from './categorizability-admin.service.js'
import { CategorizabilityController } from './categorizability.controller.js'
import { CategorizabilityStatusService } from './categorizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CategorizabilityController],
  providers: [CategorizabilityStatusService, CategorizabilityAdminService],
  exports: [CategorizabilityAdminService],
})
export class CategorizabilityModule {}
