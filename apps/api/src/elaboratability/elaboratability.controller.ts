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
import { ElaboratabilityAdminService } from './elaboratability-admin.service.js'

type ElaboratabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('elaboratability')
export class ElaboratabilityController {
  constructor(
    private readonly elaboratabilityAdminService: ElaboratabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.elaboratabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getElaboratabilityRollout() {
    return this.elaboratabilityAdminService.getElaboratabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceElaboratabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.elaboratabilityAdminService.getWorkspaceElaboratabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeElaboratabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ElaboratabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_elaboratability_summary') {
      throw new BadRequestException({
        message: 'Unsupported elaboratability admin action.',
      })
    }

    return this.elaboratabilityAdminService.executeElaboratabilityAdminAction(
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
