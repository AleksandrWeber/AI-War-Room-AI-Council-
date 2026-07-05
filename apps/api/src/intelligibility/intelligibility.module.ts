import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IntelligibilityAdminService } from './intelligibility-admin.service.js'
import { IntelligibilityController } from './intelligibility.controller.js'
import { IntelligibilityStatusService } from './intelligibility-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IntelligibilityController],
  providers: [IntelligibilityStatusService, IntelligibilityAdminService],
  exports: [IntelligibilityAdminService],
})
export class IntelligibilityModule {}
