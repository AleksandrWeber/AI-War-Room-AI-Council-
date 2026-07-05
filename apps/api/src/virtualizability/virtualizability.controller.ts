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
import { VirtualizabilityAdminService } from './virtualizability-admin.service.js'

type VirtualizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('virtualizability')
export class VirtualizabilityController {
  constructor(
    private readonly virtualizabilityAdminService: VirtualizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.virtualizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getVirtualizabilityRollout() {
    return this.virtualizabilityAdminService.getVirtualizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceVirtualizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.virtualizabilityAdminService.getWorkspaceVirtualizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeVirtualizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: VirtualizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_virtualizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported virtualizability admin action.',
      })
    }

    return this.virtualizabilityAdminService.executeVirtualizabilityAdminAction(
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
