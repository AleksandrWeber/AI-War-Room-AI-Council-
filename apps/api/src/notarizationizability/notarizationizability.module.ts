import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NotarizationizabilityAdminService } from './notarizationizability-admin.service.js'
import { NotarizationizabilityController } from './notarizationizability.controller.js'
import { NotarizationizabilityStatusService } from './notarizationizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NotarizationizabilityController],
  providers: [NotarizationizabilityStatusService, NotarizationizabilityAdminService],
  exports: [NotarizationizabilityAdminService],
})
export class NotarizationizabilityModule {}
