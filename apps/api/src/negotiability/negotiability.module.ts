import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NegotiabilityAdminService } from './negotiability-admin.service.js'
import { NegotiabilityController } from './negotiability.controller.js'
import { NegotiabilityStatusService } from './negotiability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NegotiabilityController],
  providers: [NegotiabilityStatusService, NegotiabilityAdminService],
  exports: [NegotiabilityAdminService],
})
export class NegotiabilityModule {}
