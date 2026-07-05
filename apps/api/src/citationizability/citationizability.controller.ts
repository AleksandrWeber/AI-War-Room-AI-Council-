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
import { CitationizabilityAdminService } from './citationizability-admin.service.js'

type CitationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('citationizability')
export class CitationizabilityController {
  constructor(
    private readonly citationizabilityAdminService: CitationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.citationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCitationizabilityRollout() {
    return this.citationizabilityAdminService.getCitationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCitationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.citationizabilityAdminService.getWorkspaceCitationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCitationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CitationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_citationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported citationizability admin action.',
      })
    }

    return this.citationizabilityAdminService.executeCitationizabilityAdminAction(
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
