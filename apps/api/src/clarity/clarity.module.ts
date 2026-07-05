import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ClarityAdminService } from './clarity-admin.service.js'
import { ClarityController } from './clarity.controller.js'
import { ClarityStatusService } from './clarity-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ClarityController],
  providers: [ClarityStatusService, ClarityAdminService],
  exports: [ClarityAdminService],
})
export class ClarityModule {}
