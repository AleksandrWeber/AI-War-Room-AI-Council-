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
import { AutomatabilityAdminService } from './automatability-admin.service.js'

type AutomatabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('automatability')
export class AutomatabilityController {
  constructor(
    private readonly automatabilityAdminService: AutomatabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.automatabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAutomatabilityRollout() {
    return this.automatabilityAdminService.getAutomatabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAutomatabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.automatabilityAdminService.getWorkspaceAutomatabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAutomatabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AutomatabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_automatability_summary') {
      throw new BadRequestException({
        message: 'Unsupported automatability admin action.',
      })
    }

    return this.automatabilityAdminService.executeAutomatabilityAdminAction(
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
