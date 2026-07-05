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
import { DecentralizabilityAdminService } from './decentralizability-admin.service.js'

type DecentralizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('decentralizability')
export class DecentralizabilityController {
  constructor(
    private readonly decentralizabilityAdminService: DecentralizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.decentralizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDecentralizabilityRollout() {
    return this.decentralizabilityAdminService.getDecentralizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDecentralizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.decentralizabilityAdminService.getWorkspaceDecentralizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDecentralizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DecentralizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_decentralizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported decentralizability admin action.',
      })
    }

    return this.decentralizabilityAdminService.executeDecentralizabilityAdminAction(
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
