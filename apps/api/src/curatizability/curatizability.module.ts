import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CuratizabilityAdminService } from './curatizability-admin.service.js'
import { CuratizabilityController } from './curatizability.controller.js'
import { CuratizabilityStatusService } from './curatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CuratizabilityController],
  providers: [CuratizabilityStatusService, CuratizabilityAdminService],
  exports: [CuratizabilityAdminService],
})
export class CuratizabilityModule {}
