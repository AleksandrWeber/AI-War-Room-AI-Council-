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
import { HeuristizabilityAdminService } from './heuristizability-admin.service.js'

type HeuristizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('heuristizability')
export class HeuristizabilityController {
  constructor(
    private readonly heuristizabilityAdminService: HeuristizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.heuristizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getHeuristizabilityRollout() {
    return this.heuristizabilityAdminService.getHeuristizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceHeuristizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.heuristizabilityAdminService.getWorkspaceHeuristizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeHeuristizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: HeuristizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_heuristizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported heuristizability admin action.',
      })
    }

    return this.heuristizabilityAdminService.executeHeuristizabilityAdminAction(
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
