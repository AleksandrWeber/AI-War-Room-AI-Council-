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
import { BibliographizabilityAdminService } from './bibliographizability-admin.service.js'

type BibliographizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('bibliographizability')
export class BibliographizabilityController {
  constructor(
    private readonly bibliographizabilityAdminService: BibliographizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.bibliographizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getBibliographizabilityRollout() {
    return this.bibliographizabilityAdminService.getBibliographizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceBibliographizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.bibliographizabilityAdminService.getWorkspaceBibliographizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeBibliographizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: BibliographizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_bibliographizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported bibliographizability admin action.',
      })
    }

    return this.bibliographizabilityAdminService.executeBibliographizabilityAdminAction(
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
