import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ExpirationizabilityAdminService } from './expirationizability-admin.service.js'
import { ExpirationizabilityController } from './expirationizability.controller.js'
import { ExpirationizabilityStatusService } from './expirationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ExpirationizabilityController],
  providers: [ExpirationizabilityStatusService, ExpirationizabilityAdminService],
  exports: [ExpirationizabilityAdminService],
})
export class ExpirationizabilityModule {}
