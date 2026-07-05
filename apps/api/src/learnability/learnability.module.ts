import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { LearnabilityAdminService } from './learnability-admin.service.js'
import { LearnabilityController } from './learnability.controller.js'
import { LearnabilityStatusService } from './learnability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [LearnabilityController],
  providers: [LearnabilityStatusService, LearnabilityAdminService],
  exports: [LearnabilityAdminService],
})
export class LearnabilityModule {}
