import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SemiotizabilityAdminService } from './semiotizability-admin.service.js'
import { SemiotizabilityController } from './semiotizability.controller.js'
import { SemiotizabilityStatusService } from './semiotizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SemiotizabilityController],
  providers: [SemiotizabilityStatusService, SemiotizabilityAdminService],
  exports: [SemiotizabilityAdminService],
})
export class SemiotizabilityModule {}
