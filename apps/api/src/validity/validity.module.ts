import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ValidityAdminService } from './validity-admin.service.js'
import { ValidityController } from './validity.controller.js'
import { ValidityStatusService } from './validity-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ValidityController],
  providers: [ValidityStatusService, ValidityAdminService],
  exports: [ValidityAdminService],
})
export class ValidityModule {}
