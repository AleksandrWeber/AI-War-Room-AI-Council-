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
import { ColdizabilityAdminService } from './coldizability-admin.service.js'

type ColdizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('coldizability')
export class ColdizabilityController {
  constructor(
    private readonly coldizabilityAdminService: ColdizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.coldizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getColdizabilityRollout() {
    return this.coldizabilityAdminService.getColdizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceColdizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.coldizabilityAdminService.getWorkspaceColdizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeColdizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ColdizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_coldizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported coldizability admin action.',
      })
    }

    return this.coldizabilityAdminService.executeColdizabilityAdminAction(
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
