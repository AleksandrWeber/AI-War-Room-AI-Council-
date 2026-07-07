import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AttestjournalizabilityAdminService } from './attestjournalizability-admin.service.js'
import { AttestjournalizabilityController } from './attestjournalizability.controller.js'
import { AttestjournalizabilityStatusService } from './attestjournalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AttestjournalizabilityController],
  providers: [AttestjournalizabilityStatusService, AttestjournalizabilityAdminService],
  exports: [AttestjournalizabilityAdminService],
})
export class AttestjournalizabilityModule {}
