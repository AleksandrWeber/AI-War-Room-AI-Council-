import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { MigrationAdminService } from './migration-admin.service.js'
import { MigrationController } from './migration.controller.js'
import { MigrationStatusService } from './migration-status.service.js'

@Module({
  imports: [PersistenceModule, forwardRef(() => AuthModule), WorkspacesModule],
  controllers: [MigrationController],
  providers: [MigrationStatusService, MigrationAdminService],
  exports: [MigrationAdminService],
})
export class MigrationsModule {}
