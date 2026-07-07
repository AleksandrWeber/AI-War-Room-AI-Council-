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
import { DeallocationizabilityAdminService } from './deallocationizability-admin.service.js'

type DeallocationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('deallocationizability')
export class DeallocationizabilityController {
  constructor(
    private readonly deallocationizabilityAdminService: DeallocationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.deallocationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDeallocationizabilityRollout() {
    return this.deallocationizabilityAdminService.getDeallocationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDeallocationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.deallocationizabilityAdminService.getWorkspaceDeallocationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDeallocationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DeallocationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_deallocationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported deallocationizability admin action.',
      })
    }

    return this.deallocationizabilityAdminService.executeDeallocationizabilityAdminAction(
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
