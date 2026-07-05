import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { TokenizabilityAdminService } from './tokenizability-admin.service.js'
import { TokenizabilityController } from './tokenizability.controller.js'
import { TokenizabilityStatusService } from './tokenizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [TokenizabilityController],
  providers: [TokenizabilityStatusService, TokenizabilityAdminService],
  exports: [TokenizabilityAdminService],
})
export class TokenizabilityModule {}
