import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NotarjournalizabilityAdminService } from './notarjournalizability-admin.service.js'
import { NotarjournalizabilityController } from './notarjournalizability.controller.js'
import { NotarjournalizabilityStatusService } from './notarjournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NotarjournalizabilityController],
  providers: [NotarjournalizabilityStatusService, NotarjournalizabilityAdminService],
  exports: [NotarjournalizabilityAdminService],
})
export class NotarjournalizabilityModule {}
