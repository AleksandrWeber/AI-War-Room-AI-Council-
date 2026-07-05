import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { InterpretabilityAdminService } from './interpretability-admin.service.js'
import { InterpretabilityController } from './interpretability.controller.js'
import { InterpretabilityStatusService } from './interpretability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [InterpretabilityController],
  providers: [InterpretabilityStatusService, InterpretabilityAdminService],
  exports: [InterpretabilityAdminService],
})
export class InterpretabilityModule {}
