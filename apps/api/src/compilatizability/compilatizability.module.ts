import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CompilatizabilityAdminService } from './compilatizability-admin.service.js'
import { CompilatizabilityController } from './compilatizability.controller.js'
import { CompilatizabilityStatusService } from './compilatizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CompilatizabilityController],
  providers: [CompilatizabilityStatusService, CompilatizabilityAdminService],
  exports: [CompilatizabilityAdminService],
})
export class CompilatizabilityModule {}
