import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ShardingizabilityAdminService } from './shardingizability-admin.service.js'
import { ShardingizabilityController } from './shardingizability.controller.js'
import { ShardingizabilityStatusService } from './shardingizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ShardingizabilityController],
  providers: [ShardingizabilityStatusService, ShardingizabilityAdminService],
  exports: [ShardingizabilityAdminService],
})
export class ShardingizabilityModule {}
