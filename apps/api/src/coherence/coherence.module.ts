import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CoherenceAdminService } from './coherence-admin.service.js'
import { CoherenceController } from './coherence.controller.js'
import { CoherenceStatusService } from './coherence-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CoherenceController],
  providers: [CoherenceStatusService, CoherenceAdminService],
  exports: [CoherenceAdminService],
})
export class CoherenceModule {}
