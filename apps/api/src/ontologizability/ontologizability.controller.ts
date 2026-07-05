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
import { OntologizabilityAdminService } from './ontologizability-admin.service.js'

type OntologizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('ontologizability')
export class OntologizabilityController {
  constructor(
    private readonly ontologizabilityAdminService: OntologizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.ontologizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getOntologizabilityRollout() {
    return this.ontologizabilityAdminService.getOntologizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceOntologizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.ontologizabilityAdminService.getWorkspaceOntologizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeOntologizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: OntologizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_ontologizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported ontologizability admin action.',
      })
    }

    return this.ontologizabilityAdminService.executeOntologizabilityAdminAction(
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
