import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ElasticizabilityAdminService } from './elasticizability-admin.service.js'
import { ElasticizabilityController } from './elasticizability.controller.js'
import { ElasticizabilityStatusService } from './elasticizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ElasticizabilityController],
  providers: [ElasticizabilityStatusService, ElasticizabilityAdminService],
  exports: [ElasticizabilityAdminService],
})
export class ElasticizabilityModule {}
