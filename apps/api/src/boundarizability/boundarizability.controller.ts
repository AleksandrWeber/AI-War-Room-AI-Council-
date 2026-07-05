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
import { BoundarizabilityAdminService } from './boundarizability-admin.service.js'

type BoundarizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('boundarizability')
export class BoundarizabilityController {
  constructor(
    private readonly boundarizabilityAdminService: BoundarizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.boundarizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBoundarizabilityRollout() {
    return this.boundarizabilityAdminService.getBoundarizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBoundarizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.boundarizabilityAdminService.getWorkspaceBoundarizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBoundarizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BoundarizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_boundarizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported boundarizability admin action.',
      })
    }

    return this.boundarizabilityAdminService.executeBoundarizabilityAdminAction(
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
