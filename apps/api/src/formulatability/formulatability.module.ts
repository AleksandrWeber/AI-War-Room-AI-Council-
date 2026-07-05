import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { FormulatabilityAdminService } from './formulatability-admin.service.js'
import { FormulatabilityController } from './formulatability.controller.js'
import { FormulatabilityStatusService } from './formulatability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [FormulatabilityController],
  providers: [FormulatabilityStatusService, FormulatabilityAdminService],
  exports: [FormulatabilityAdminService],
})
export class FormulatabilityModule {}
