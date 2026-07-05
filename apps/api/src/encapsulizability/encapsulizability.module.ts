import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EncapsulizabilityAdminService } from './encapsulizability-admin.service.js'
import { EncapsulizabilityController } from './encapsulizability.controller.js'
import { EncapsulizabilityStatusService } from './encapsulizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [EncapsulizabilityController],
  providers: [EncapsulizabilityStatusService, EncapsulizabilityAdminService],
  exports: [EncapsulizabilityAdminService],
})
export class EncapsulizabilityModule {}
