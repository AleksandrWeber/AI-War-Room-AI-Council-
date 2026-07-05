import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FormalizabilityAdminService } from './formalizability-admin.service.js'
import { FormalizabilityController } from './formalizability.controller.js'
import { FormalizabilityStatusService } from './formalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FormalizabilityController],
  providers: [FormalizabilityStatusService, FormalizabilityAdminService],
  exports: [FormalizabilityAdminService],
})
export class FormalizabilityModule {}
