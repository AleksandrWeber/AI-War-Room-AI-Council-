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
import { DisclosureizabilityAdminService } from './disclosureizability-admin.service.js'

type DisclosureizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('disclosureizability')
export class DisclosureizabilityController {
  constructor(
    private readonly disclosureizabilityAdminService: DisclosureizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.disclosureizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDisclosureizabilityRollout() {
    return this.disclosureizabilityAdminService.getDisclosureizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDisclosureizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.disclosureizabilityAdminService.getWorkspaceDisclosureizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDisclosureizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DisclosureizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_disclosureizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported disclosureizability admin action.',
      })
    }

    return this.disclosureizabilityAdminService.executeDisclosureizabilityAdminAction(
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
