import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IntegrityAdminService } from './integrity-admin.service.js'
import { IntegrityController } from './integrity.controller.js'
import { IntegrityStatusService } from './integrity-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [IntegrityController],
  providers: [IntegrityStatusService, IntegrityAdminService],
  exports: [IntegrityAdminService],
})
export class IntegrityModule {}
