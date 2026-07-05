import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TransparencyAdminService } from './transparency-admin.service.js'
import { TransparencyController } from './transparency.controller.js'
import { TransparencyStatusService } from './transparency-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TransparencyController],
  providers: [TransparencyStatusService, TransparencyAdminService],
  exports: [TransparencyAdminService],
})
export class TransparencyModule {}
