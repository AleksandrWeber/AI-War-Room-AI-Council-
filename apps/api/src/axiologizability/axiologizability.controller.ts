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
import { AxiologizabilityAdminService } from './axiologizability-admin.service.js'

type AxiologizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('axiologizability')
export class AxiologizabilityController {
  constructor(
    private readonly axiologizabilityAdminService: AxiologizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.axiologizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAxiologizabilityRollout() {
    return this.axiologizabilityAdminService.getAxiologizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAxiologizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.axiologizabilityAdminService.getWorkspaceAxiologizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAxiologizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AxiologizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_axiologizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported axiologizability admin action.',
      })
    }

    return this.axiologizabilityAdminService.executeAxiologizabilityAdminAction(
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
