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
import { UnicastizabilityAdminService } from './unicastizability-admin.service.js'

type UnicastizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('unicastizability')
export class UnicastizabilityController {
  constructor(
    private readonly unicastizabilityAdminService: UnicastizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.unicastizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getUnicastizabilityRollout() {
    return this.unicastizabilityAdminService.getUnicastizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceUnicastizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.unicastizabilityAdminService.getWorkspaceUnicastizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeUnicastizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: UnicastizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_unicastizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported unicastizability admin action.',
      })
    }

    return this.unicastizabilityAdminService.executeUnicastizabilityAdminAction(
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
