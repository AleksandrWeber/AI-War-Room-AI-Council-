import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SimplicityAdminService } from './simplicity-admin.service.js'
import { SimplicityController } from './simplicity.controller.js'
import { SimplicityStatusService } from './simplicity-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SimplicityController],
  providers: [SimplicityStatusService, SimplicityAdminService],
  exports: [SimplicityAdminService],
})
export class SimplicityModule {}
