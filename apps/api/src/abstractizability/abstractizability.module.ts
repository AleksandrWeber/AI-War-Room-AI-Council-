import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { AbstractizabilityAdminService } from './abstractizability-admin.service.js'
import { AbstractizabilityController } from './abstractizability.controller.js'
import { AbstractizabilityStatusService } from './abstractizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [AbstractizabilityController],
  providers: [AbstractizabilityStatusService, AbstractizabilityAdminService],
  exports: [AbstractizabilityAdminService],
})
export class AbstractizabilityModule {}
