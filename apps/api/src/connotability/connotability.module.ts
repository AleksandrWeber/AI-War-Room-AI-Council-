import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConnotabilityAdminService } from './connotability-admin.service.js'
import { ConnotabilityController } from './connotability.controller.js'
import { ConnotabilityStatusService } from './connotability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConnotabilityController],
  providers: [ConnotabilityStatusService, ConnotabilityAdminService],
  exports: [ConnotabilityAdminService],
})
export class ConnotabilityModule {}
