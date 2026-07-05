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
import { DeducizabilityAdminService } from './deducizability-admin.service.js'

type DeducizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('deducizability')
export class DeducizabilityController {
  constructor(
    private readonly deducizabilityAdminService: DeducizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.deducizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDeducizabilityRollout() {
    return this.deducizabilityAdminService.getDeducizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDeducizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.deducizabilityAdminService.getWorkspaceDeducizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDeducizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DeducizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_deducizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported deducizability admin action.',
      })
    }

    return this.deducizabilityAdminService.executeDeducizabilityAdminAction(
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
