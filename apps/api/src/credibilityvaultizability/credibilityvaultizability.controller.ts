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
import { CredibilityvaultizabilityAdminService } from './credibilityvaultizability-admin.service.js'

type CredibilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('credibilityvaultizability')
export class CredibilityvaultizabilityController {
  constructor(
    private readonly credibilityvaultizabilityAdminService: CredibilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.credibilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCredibilityvaultizabilityRollout() {
    return this.credibilityvaultizabilityAdminService.getCredibilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCredibilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.credibilityvaultizabilityAdminService.getWorkspaceCredibilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCredibilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CredibilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_credibilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported credibilityvaultizability admin action.',
      })
    }

    return this.credibilityvaultizabilityAdminService.executeCredibilityvaultizabilityAdminAction(
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
