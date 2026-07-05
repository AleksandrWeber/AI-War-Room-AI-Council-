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
import { MigratizabilityAdminService } from './migratizability-admin.service.js'

type MigratizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('migratizability')
export class MigratizabilityController {
  constructor(
    private readonly migratizabilityAdminService: MigratizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.migratizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMigratizabilityRollout() {
    return this.migratizabilityAdminService.getMigratizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMigratizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.migratizabilityAdminService.getWorkspaceMigratizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMigratizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MigratizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_migratizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported migratizability admin action.',
      })
    }

    return this.migratizabilityAdminService.executeMigratizabilityAdminAction(
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
