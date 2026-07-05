import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { CacheizabilityAdminService } from './cacheizability-admin.service.js'
import { CacheizabilityController } from './cacheizability.controller.js'
import { CacheizabilityStatusService } from './cacheizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [CacheizabilityController],
  providers: [CacheizabilityStatusService, CacheizabilityAdminService],
  exports: [CacheizabilityAdminService],
})
export class CacheizabilityModule {}
