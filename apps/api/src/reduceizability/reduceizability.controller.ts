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
import { ReduceizabilityAdminService } from './reduceizability-admin.service.js'

type ReduceizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('reduceizability')
export class ReduceizabilityController {
  constructor(
    private readonly reduceizabilityAdminService: ReduceizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.reduceizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getReduceizabilityRollout() {
    return this.reduceizabilityAdminService.getReduceizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceReduceizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.reduceizabilityAdminService.getWorkspaceReduceizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeReduceizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ReduceizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_reduceizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported reduceizability admin action.',
      })
    }

    return this.reduceizabilityAdminService.executeReduceizabilityAdminAction(
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
