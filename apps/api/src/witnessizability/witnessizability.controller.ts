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
import { WitnessizabilityAdminService } from './witnessizability-admin.service.js'

type WitnessizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('witnessizability')
export class WitnessizabilityController {
  constructor(
    private readonly witnessizabilityAdminService: WitnessizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.witnessizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getWitnessizabilityRollout() {
    return this.witnessizabilityAdminService.getWitnessizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceWitnessizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.witnessizabilityAdminService.getWorkspaceWitnessizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeWitnessizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WitnessizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_witnessizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported witnessizability admin action.',
      })
    }

    return this.witnessizabilityAdminService.executeWitnessizabilityAdminAction(
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
