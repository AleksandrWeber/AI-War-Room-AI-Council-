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
import { InterpolizabilityAdminService } from './interpolizability-admin.service.js'

type InterpolizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('interpolizability')
export class InterpolizabilityController {
  constructor(
    private readonly interpolizabilityAdminService: InterpolizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.interpolizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInterpolizabilityRollout() {
    return this.interpolizabilityAdminService.getInterpolizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInterpolizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.interpolizabilityAdminService.getWorkspaceInterpolizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInterpolizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InterpolizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_interpolizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported interpolizability admin action.',
      })
    }

    return this.interpolizabilityAdminService.executeInterpolizabilityAdminAction(
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
