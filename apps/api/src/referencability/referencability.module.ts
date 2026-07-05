import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReferencabilityAdminService } from './referencability-admin.service.js'
import { ReferencabilityController } from './referencability.controller.js'
import { ReferencabilityStatusService } from './referencability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReferencabilityController],
  providers: [ReferencabilityStatusService, ReferencabilityAdminService],
  exports: [ReferencabilityAdminService],
})
export class ReferencabilityModule {}
