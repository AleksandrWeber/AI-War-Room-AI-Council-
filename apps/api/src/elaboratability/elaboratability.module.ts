import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ElaboratabilityAdminService } from './elaboratability-admin.service.js'
import { ElaboratabilityController } from './elaboratability.controller.js'
import { ElaboratabilityStatusService } from './elaboratability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ElaboratabilityController],
  providers: [ElaboratabilityStatusService, ElaboratabilityAdminService],
  exports: [ElaboratabilityAdminService],
})
export class ElaboratabilityModule {}
