import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LexicalizabilityAdminService } from './lexicalizability-admin.service.js'
import { LexicalizabilityController } from './lexicalizability.controller.js'
import { LexicalizabilityStatusService } from './lexicalizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LexicalizabilityController],
  providers: [LexicalizabilityStatusService, LexicalizabilityAdminService],
  exports: [LexicalizabilityAdminService],
})
export class LexicalizabilityModule {}
