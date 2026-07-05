import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AssuranceAdminService } from './assurance-admin.service.js'
import { AssuranceController } from './assurance.controller.js'
import { AssuranceStatusService } from './assurance-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AssuranceController],
  providers: [AssuranceStatusService, AssuranceAdminService],
  exports: [AssuranceAdminService],
})
export class AssuranceModule {}
