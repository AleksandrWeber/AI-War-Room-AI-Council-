import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { SymbolizabilityAdminService } from './symbolizability-admin.service.js'
import { SymbolizabilityController } from './symbolizability.controller.js'
import { SymbolizabilityStatusService } from './symbolizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [SymbolizabilityController],
  providers: [SymbolizabilityStatusService, SymbolizabilityAdminService],
  exports: [SymbolizabilityAdminService],
})
export class SymbolizabilityModule {}
