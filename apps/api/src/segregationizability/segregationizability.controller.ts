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
import { SegregationizabilityAdminService } from './segregationizability-admin.service.js'

type SegregationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('segregationizability')
export class SegregationizabilityController {
  constructor(
    private readonly segregationizabilityAdminService: SegregationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.segregationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSegregationizabilityRollout() {
    return this.segregationizabilityAdminService.getSegregationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSegregationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.segregationizabilityAdminService.getWorkspaceSegregationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSegregationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SegregationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_segregationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported segregationizability admin action.',
      })
    }

    return this.segregationizabilityAdminService.executeSegregationizabilityAdminAction(
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
