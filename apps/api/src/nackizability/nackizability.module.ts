import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NackizabilityAdminService } from './nackizability-admin.service.js'
import { NackizabilityController } from './nackizability.controller.js'
import { NackizabilityStatusService } from './nackizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NackizabilityController],
  providers: [NackizabilityStatusService, NackizabilityAdminService],
  exports: [NackizabilityAdminService],
})
export class NackizabilityModule {}
