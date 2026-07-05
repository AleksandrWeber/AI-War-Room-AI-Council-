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
import { RobustizabilityAdminService } from './robustizability-admin.service.js'

type RobustizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('robustizability')
export class RobustizabilityController {
  constructor(
    private readonly robustizabilityAdminService: RobustizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.robustizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRobustizabilityRollout() {
    return this.robustizabilityAdminService.getRobustizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRobustizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.robustizabilityAdminService.getWorkspaceRobustizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRobustizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RobustizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_robustizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported robustizability admin action.',
      })
    }

    return this.robustizabilityAdminService.executeRobustizabilityAdminAction(
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
