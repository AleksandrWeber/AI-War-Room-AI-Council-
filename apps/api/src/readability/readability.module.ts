import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReadabilityAdminService } from './readability-admin.service.js'
import { ReadabilityController } from './readability.controller.js'
import { ReadabilityStatusService } from './readability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReadabilityController],
  providers: [ReadabilityStatusService, ReadabilityAdminService],
  exports: [ReadabilityAdminService],
})
export class ReadabilityModule {}
