import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { DecompressizabilityAdminService } from './decompressizability-admin.service.js'
import { DecompressizabilityController } from './decompressizability.controller.js'
import { DecompressizabilityStatusService } from './decompressizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [DecompressizabilityController],
  providers: [DecompressizabilityStatusService, DecompressizabilityAdminService],
  exports: [DecompressizabilityAdminService],
})
export class DecompressizabilityModule {}
