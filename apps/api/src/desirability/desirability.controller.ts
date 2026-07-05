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
import { DesirabilityAdminService } from './desirability-admin.service.js'

type DesirabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('desirability')
export class DesirabilityController {
  constructor(
    private readonly desirabilityAdminService: DesirabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.desirabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDesirabilityRollout() {
    return this.desirabilityAdminService.getDesirabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDesirabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.desirabilityAdminService.getWorkspaceDesirabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDesirabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DesirabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_desirability_summary') {
      throw new BadRequestException({
        message: 'Unsupported desirability admin action.',
      })
    }

    return this.desirabilityAdminService.executeDesirabilityAdminAction(
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
