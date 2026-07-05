import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CompatibilityAdminService } from './compatibility-admin.service.js'
import { CompatibilityController } from './compatibility.controller.js'
import { CompatibilityStatusService } from './compatibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CompatibilityController],
  providers: [CompatibilityStatusService, CompatibilityAdminService],
  exports: [CompatibilityAdminService],
})
export class CompatibilityModule {}
