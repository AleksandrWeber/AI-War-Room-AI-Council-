import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TtlizabilityAdminService } from './ttlizability-admin.service.js'
import { TtlizabilityController } from './ttlizability.controller.js'
import { TtlizabilityStatusService } from './ttlizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TtlizabilityController],
  providers: [TtlizabilityStatusService, TtlizabilityAdminService],
  exports: [TtlizabilityAdminService],
})
export class TtlizabilityModule {}
