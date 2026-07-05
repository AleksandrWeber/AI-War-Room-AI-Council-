import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { JournalizabilityAdminService } from './journalizability-admin.service.js'
import { JournalizabilityController } from './journalizability.controller.js'
import { JournalizabilityStatusService } from './journalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [JournalizabilityController],
  providers: [JournalizabilityStatusService, JournalizabilityAdminService],
  exports: [JournalizabilityAdminService],
})
export class JournalizabilityModule {}
