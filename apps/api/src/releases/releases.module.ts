import { Module, forwardRef } from '@nestjs/common'
import { AuthModule } from '../auth/auth.module.js'
import { MigrationsModule } from '../migrations/migrations.module.js'
import { PersistenceModule } from '../persistence/persistence.module.js'
import { WorkspacesModule } from '../workspaces/workspaces.module.js'
import { ReleaseAdminService } from './release-admin.service.js'
import { ReleaseController } from './release.controller.js'
import { ReleaseStatusService } from './release-status.service.js'

@Module({
  imports: [
    PersistenceModule,
    MigrationsModule,
    forwardRef(() => AuthModule),
    WorkspacesModule,
  ],
  controllers: [ReleaseController],
  providers: [ReleaseStatusService, ReleaseAdminService],
  exports: [ReleaseAdminService],
})
export class ReleasesModule {}
