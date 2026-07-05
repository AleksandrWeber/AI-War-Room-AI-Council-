import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ConsistencyAdminService } from './consistency-admin.service.js'
import { ConsistencyController } from './consistency.controller.js'
import { ConsistencyStatusService } from './consistency-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ConsistencyController],
  providers: [ConsistencyStatusService, ConsistencyAdminService],
  exports: [ConsistencyAdminService],
})
export class ConsistencyModule {}
