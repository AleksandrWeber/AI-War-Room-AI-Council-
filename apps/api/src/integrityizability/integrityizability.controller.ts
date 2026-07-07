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
import { IntegrityizabilityAdminService } from './integrityizability-admin.service.js'

type IntegrityizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('integrityizability')
export class IntegrityizabilityController {
  constructor(
    private readonly integrityizabilityAdminService: IntegrityizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.integrityizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIntegrityizabilityRollout() {
    return this.integrityizabilityAdminService.getIntegrityizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIntegrityizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.integrityizabilityAdminService.getWorkspaceIntegrityizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIntegrityizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IntegrityizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_integrityizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported integrityizability admin action.',
      })
    }

    return this.integrityizabilityAdminService.executeIntegrityizabilityAdminAction(
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
