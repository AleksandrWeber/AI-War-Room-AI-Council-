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
import { ParabolizabilityAdminService } from './parabolizability-admin.service.js'

type ParabolizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('parabolizability')
export class ParabolizabilityController {
  constructor(
    private readonly parabolizabilityAdminService: ParabolizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.parabolizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getParabolizabilityRollout() {
    return this.parabolizabilityAdminService.getParabolizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceParabolizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.parabolizabilityAdminService.getWorkspaceParabolizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeParabolizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ParabolizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_parabolizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported parabolizability admin action.',
      })
    }

    return this.parabolizabilityAdminService.executeParabolizabilityAdminAction(
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
