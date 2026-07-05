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
import { SignifiabilityAdminService } from './signifiability-admin.service.js'

type SignifiabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('signifiability')
export class SignifiabilityController {
  constructor(
    private readonly signifiabilityAdminService: SignifiabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.signifiabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSignifiabilityRollout() {
    return this.signifiabilityAdminService.getSignifiabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSignifiabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.signifiabilityAdminService.getWorkspaceSignifiabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSignifiabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SignifiabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_signifiability_summary') {
      throw new BadRequestException({
        message: 'Unsupported signifiability admin action.',
      })
    }

    return this.signifiabilityAdminService.executeSignifiabilityAdminAction(
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
