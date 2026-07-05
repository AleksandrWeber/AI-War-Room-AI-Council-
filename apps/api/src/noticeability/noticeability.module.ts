import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { NoticeabilityAdminService } from './noticeability-admin.service.js'
import { NoticeabilityController } from './noticeability.controller.js'
import { NoticeabilityStatusService } from './noticeability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [NoticeabilityController],
  providers: [NoticeabilityStatusService, NoticeabilityAdminService],
  exports: [NoticeabilityAdminService],
})
export class NoticeabilityModule {}
