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
import { ProvenancevaultizabilityAdminService } from './provenancevaultizability-admin.service.js'

type ProvenancevaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('provenancevaultizability')
export class ProvenancevaultizabilityController {
  constructor(
    private readonly provenancevaultizabilityAdminService: ProvenancevaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.provenancevaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProvenancevaultizabilityRollout() {
    return this.provenancevaultizabilityAdminService.getProvenancevaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProvenancevaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.provenancevaultizabilityAdminService.getWorkspaceProvenancevaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProvenancevaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProvenancevaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_provenancevaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported provenancevaultizability admin action.',
      })
    }

    return this.provenancevaultizabilityAdminService.executeProvenancevaultizabilityAdminAction(
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
