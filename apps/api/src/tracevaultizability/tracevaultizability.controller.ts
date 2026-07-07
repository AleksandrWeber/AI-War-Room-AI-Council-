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
import { TracevaultizabilityAdminService } from './tracevaultizability-admin.service.js'

type TracevaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('tracevaultizability')
export class TracevaultizabilityController {
  constructor(
    private readonly tracevaultizabilityAdminService: TracevaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.tracevaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTracevaultizabilityRollout() {
    return this.tracevaultizabilityAdminService.getTracevaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTracevaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.tracevaultizabilityAdminService.getWorkspaceTracevaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTracevaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TracevaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_tracevaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported tracevaultizability admin action.',
      })
    }

    return this.tracevaultizabilityAdminService.executeTracevaultizabilityAdminAction(
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
