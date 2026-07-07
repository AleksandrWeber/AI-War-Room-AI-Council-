import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NonrepudiationizabilityAdminService } from './nonrepudiationizability-admin.service.js'
import { NonrepudiationizabilityController } from './nonrepudiationizability.controller.js'
import { NonrepudiationizabilityStatusService } from './nonrepudiationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NonrepudiationizabilityController],
  providers: [NonrepudiationizabilityStatusService, NonrepudiationizabilityAdminService],
  exports: [NonrepudiationizabilityAdminService],
})
export class NonrepudiationizabilityModule {}
