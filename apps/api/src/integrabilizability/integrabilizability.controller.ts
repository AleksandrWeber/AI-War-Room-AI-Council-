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
import { IntegrabilizabilityAdminService } from './integrabilizability-admin.service.js'

type IntegrabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('integrabilizability')
export class IntegrabilizabilityController {
  constructor(
    private readonly integrabilizabilityAdminService: IntegrabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.integrabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIntegrabilizabilityRollout() {
    return this.integrabilizabilityAdminService.getIntegrabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIntegrabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.integrabilizabilityAdminService.getWorkspaceIntegrabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIntegrabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IntegrabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_integrabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported integrabilizability admin action.',
      })
    }

    return this.integrabilizabilityAdminService.executeIntegrabilizabilityAdminAction(
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
