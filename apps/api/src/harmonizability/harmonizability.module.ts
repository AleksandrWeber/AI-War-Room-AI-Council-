import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { HarmonizabilityAdminService } from './harmonizability-admin.service.js'
import { HarmonizabilityController } from './harmonizability.controller.js'
import { HarmonizabilityStatusService } from './harmonizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [HarmonizabilityController],
  providers: [HarmonizabilityStatusService, HarmonizabilityAdminService],
  exports: [HarmonizabilityAdminService],
})
export class HarmonizabilityModule {}
