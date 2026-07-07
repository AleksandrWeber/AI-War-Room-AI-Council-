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
import { ZerotrustizabilityAdminService } from './zerotrustizability-admin.service.js'

type ZerotrustizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('zerotrustizability')
export class ZerotrustizabilityController {
  constructor(
    private readonly zerotrustizabilityAdminService: ZerotrustizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.zerotrustizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getZerotrustizabilityRollout() {
    return this.zerotrustizabilityAdminService.getZerotrustizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceZerotrustizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.zerotrustizabilityAdminService.getWorkspaceZerotrustizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeZerotrustizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ZerotrustizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_zerotrustizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported zerotrustizability admin action.',
      })
    }

    return this.zerotrustizabilityAdminService.executeZerotrustizabilityAdminAction(
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
