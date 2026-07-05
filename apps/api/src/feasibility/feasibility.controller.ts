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
import { FeasibilityAdminService } from './feasibility-admin.service.js'

type FeasibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('feasibility')
export class FeasibilityController {
  constructor(
    private readonly feasibilityAdminService: FeasibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.feasibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFeasibilityRollout() {
    return this.feasibilityAdminService.getFeasibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFeasibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.feasibilityAdminService.getWorkspaceFeasibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFeasibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FeasibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_feasibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported feasibility admin action.',
      })
    }

    return this.feasibilityAdminService.executeFeasibilityAdminAction(
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
