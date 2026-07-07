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
import { OversightizabilityAdminService } from './oversightizability-admin.service.js'

type OversightizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('oversightizability')
export class OversightizabilityController {
  constructor(
    private readonly oversightizabilityAdminService: OversightizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.oversightizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOversightizabilityRollout() {
    return this.oversightizabilityAdminService.getOversightizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOversightizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.oversightizabilityAdminService.getWorkspaceOversightizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOversightizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OversightizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_oversightizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported oversightizability admin action.',
      })
    }

    return this.oversightizabilityAdminService.executeOversightizabilityAdminAction(
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
