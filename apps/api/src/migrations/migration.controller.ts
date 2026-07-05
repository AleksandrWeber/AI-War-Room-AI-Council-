import {
  Body,
  Controller,
  BadRequestException,
  ForbiddenException,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  type AuthenticatedRequest,
  WorkspaceAccessGuard,
} from '../auth/workspace-access.guard.js'
import { MigrationAdminService } from './migration-admin.service.js'

type MigrationAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('migrations')
export class MigrationController {
  constructor(
    private readonly migrationAdminService: MigrationAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.migrationAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMigrationRollout() {
    return this.migrationAdminService.getMigrationRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMigrationAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.migrationAdminService.getWorkspaceMigrationAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMigrationAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MigrationAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_migration_summary') {
      throw new BadRequestException({
        message: 'Unsupported migration admin action.',
      })
    }

    return this.migrationAdminService.executeMigrationAdminAction(
      request.authContext!,
      {
        workspaceId,
        action,
      },
    )
  }

  private assertWorkspaceParam(
    request: AuthenticatedRequest,
    workspaceId: string,
  ) {
    const requestWorkspaceId = request.authContext?.workspaceId

    if (requestWorkspaceId && requestWorkspaceId !== workspaceId) {
      throw new ForbiddenException({
        message: 'Workspace parameter does not match authenticated workspace.',
      })
    }
  }
}
