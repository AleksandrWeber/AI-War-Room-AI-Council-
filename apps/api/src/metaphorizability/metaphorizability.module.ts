import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MetaphorizabilityAdminService } from './metaphorizability-admin.service.js'
import { MetaphorizabilityController } from './metaphorizability.controller.js'
import { MetaphorizabilityStatusService } from './metaphorizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [MetaphorizabilityController],
  providers: [MetaphorizabilityStatusService, MetaphorizabilityAdminService],
  exports: [MetaphorizabilityAdminService],
})
export class MetaphorizabilityModule {}
