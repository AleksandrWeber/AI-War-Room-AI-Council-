import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { MigrationsModule } from '../migrations/migrations.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { BackupAdminService } from './backup-admin.service.js'
import { BackupController } from './backup.controller.js'
import { BackupStatusService } from './backup-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    MigrationsModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [BackupController],
  providers: [BackupStatusService, BackupAdminService],
  exports: [BackupAdminService],
})
export class BackupModule {}
