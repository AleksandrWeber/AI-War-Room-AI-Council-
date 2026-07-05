import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ContextualizabilityAdminService } from './contextualizability-admin.service.js'
import { ContextualizabilityController } from './contextualizability.controller.js'
import { ContextualizabilityStatusService } from './contextualizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ContextualizabilityController],
  providers: [ContextualizabilityStatusService, ContextualizabilityAdminService],
  exports: [ContextualizabilityAdminService],
})
export class ContextualizabilityModule {}
