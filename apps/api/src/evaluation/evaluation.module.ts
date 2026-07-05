import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { EvaluationAdminService } from './evaluation-admin.service.js'
import { EvaluationController } from './evaluation.controller.js'

@Module({
  imports: [forwardRef(() => AuthModule), WorkspacesModule],
  controllers: [EvaluationController],
  providers: [EvaluationAdminService],
  exports: [EvaluationAdminService],
})
export class EvaluationModule {}
