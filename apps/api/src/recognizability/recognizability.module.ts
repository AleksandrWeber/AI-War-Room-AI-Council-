import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { RecognizabilityAdminService } from './recognizability-admin.service.js'
import { RecognizabilityController } from './recognizability.controller.js'
import { RecognizabilityStatusService } from './recognizability-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [RecognizabilityController],
  providers: [RecognizabilityStatusService, RecognizabilityAdminService],
  exports: [RecognizabilityAdminService],
})
export class RecognizabilityModule {}
