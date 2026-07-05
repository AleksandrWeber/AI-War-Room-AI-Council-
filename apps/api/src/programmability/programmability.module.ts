import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ProgrammabilityAdminService } from './programmability-admin.service.js'
import { ProgrammabilityController } from './programmability.controller.js'
import { ProgrammabilityStatusService } from './programmability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ProgrammabilityController],
  providers: [ProgrammabilityStatusService, ProgrammabilityAdminService],
  exports: [ProgrammabilityAdminService],
})
export class ProgrammabilityModule {}
