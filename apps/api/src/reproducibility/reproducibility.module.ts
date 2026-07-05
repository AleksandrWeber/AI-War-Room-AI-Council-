import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReproducibilityAdminService } from './reproducibility-admin.service.js'
import { ReproducibilityController } from './reproducibility.controller.js'
import { ReproducibilityStatusService } from './reproducibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReproducibilityController],
  providers: [ReproducibilityStatusService, ReproducibilityAdminService],
  exports: [ReproducibilityAdminService],
})
export class ReproducibilityModule {}
