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
import { IntegrabilityAdminService } from './integrability-admin.service.js'

type IntegrabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('integrability')
export class IntegrabilityController {
  constructor(
    private readonly integrabilityAdminService: IntegrabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.integrabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIntegrabilityRollout() {
    return this.integrabilityAdminService.getIntegrabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIntegrabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.integrabilityAdminService.getWorkspaceIntegrabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIntegrabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IntegrabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_integrability_summary') {
      throw new BadRequestException({
        message: 'Unsupported integrability admin action.',
      })
    }

    return this.integrabilityAdminService.executeIntegrabilityAdminAction(
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
