import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SustainizabilityAdminService } from './sustainizability-admin.service.js'
import { SustainizabilityController } from './sustainizability.controller.js'
import { SustainizabilityStatusService } from './sustainizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SustainizabilityController],
  providers: [SustainizabilityStatusService, SustainizabilityAdminService],
  exports: [SustainizabilityAdminService],
})
export class SustainizabilityModule {}
