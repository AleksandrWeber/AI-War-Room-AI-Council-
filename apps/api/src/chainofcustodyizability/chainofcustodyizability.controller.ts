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
import { ChainofcustodyizabilityAdminService } from './chainofcustodyizability-admin.service.js'

type ChainofcustodyizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('chainofcustodyizability')
export class ChainofcustodyizabilityController {
  constructor(
    private readonly chainofcustodyizabilityAdminService: ChainofcustodyizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.chainofcustodyizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getChainofcustodyizabilityRollout() {
    return this.chainofcustodyizabilityAdminService.getChainofcustodyizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceChainofcustodyizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.chainofcustodyizabilityAdminService.getWorkspaceChainofcustodyizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeChainofcustodyizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ChainofcustodyizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_chainofcustodyizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported chainofcustodyizability admin action.',
      })
    }

    return this.chainofcustodyizabilityAdminService.executeChainofcustodyizabilityAdminAction(
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
