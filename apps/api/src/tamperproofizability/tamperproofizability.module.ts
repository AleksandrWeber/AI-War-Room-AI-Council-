import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TamperproofizabilityAdminService } from './tamperproofizability-admin.service.js'
import { TamperproofizabilityController } from './tamperproofizability.controller.js'
import { TamperproofizabilityStatusService } from './tamperproofizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TamperproofizabilityController],
  providers: [TamperproofizabilityStatusService, TamperproofizabilityAdminService],
  exports: [TamperproofizabilityAdminService],
})
export class TamperproofizabilityModule {}
