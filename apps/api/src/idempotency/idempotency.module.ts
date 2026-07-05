import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { IdempotencyAdminService } from './idempotency-admin.service.js'
import { IdempotencyController } from './idempotency.controller.js'

@Module({
  imports: [PersistenceModule, forwardRef(() => AuthModule), WorkspacesModule],
  controllers: [IdempotencyController],
  providers: [IdempotencyAdminService],
  exports: [IdempotencyAdminService],
})
export class IdempotencyModule {}
