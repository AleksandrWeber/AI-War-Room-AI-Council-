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
import { BackupizabilityAdminService } from './backupizability-admin.service.js'

type BackupizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('backupizability')
export class BackupizabilityController {
  constructor(
    private readonly backupizabilityAdminService: BackupizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.backupizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBackupizabilityRollout() {
    return this.backupizabilityAdminService.getBackupizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBackupizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.backupizabilityAdminService.getWorkspaceBackupizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBackupizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BackupizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_backupizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported backupizability admin action.',
      })
    }

    return this.backupizabilityAdminService.executeBackupizabilityAdminAction(
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
