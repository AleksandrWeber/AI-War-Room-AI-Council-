import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DebouncizabilityAdminService } from './debouncizability-admin.service.js'
import { DebouncizabilityController } from './debouncizability.controller.js'
import { DebouncizabilityStatusService } from './debouncizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DebouncizabilityController],
  providers: [DebouncizabilityStatusService, DebouncizabilityAdminService],
  exports: [DebouncizabilityAdminService],
})
export class DebouncizabilityModule {}
