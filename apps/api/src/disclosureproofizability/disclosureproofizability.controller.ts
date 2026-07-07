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
import { DisclosureproofizabilityAdminService } from './disclosureproofizability-admin.service.js'

type DisclosureproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('disclosureproofizability')
export class DisclosureproofizabilityController {
  constructor(
    private readonly disclosureproofizabilityAdminService: DisclosureproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.disclosureproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDisclosureproofizabilityRollout() {
    return this.disclosureproofizabilityAdminService.getDisclosureproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDisclosureproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.disclosureproofizabilityAdminService.getWorkspaceDisclosureproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDisclosureproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DisclosureproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_disclosureproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported disclosureproofizability admin action.',
      })
    }

    return this.disclosureproofizabilityAdminService.executeDisclosureproofizabilityAdminAction(
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
