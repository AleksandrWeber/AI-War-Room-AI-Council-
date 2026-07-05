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
import { DependabilityAdminService } from './dependability-admin.service.js'

type DependabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('dependability')
export class DependabilityController {
  constructor(
    private readonly dependabilityAdminService: DependabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.dependabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDependabilityRollout() {
    return this.dependabilityAdminService.getDependabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDependabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.dependabilityAdminService.getWorkspaceDependabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDependabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DependabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_dependability_summary') {
      throw new BadRequestException({
        message: 'Unsupported dependability admin action.',
      })
    }

    return this.dependabilityAdminService.executeDependabilityAdminAction(
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
