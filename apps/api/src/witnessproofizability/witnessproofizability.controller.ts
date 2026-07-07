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
import { WitnessproofizabilityAdminService } from './witnessproofizability-admin.service.js'

type WitnessproofizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('witnessproofizability')
export class WitnessproofizabilityController {
  constructor(
    private readonly witnessproofizabilityAdminService: WitnessproofizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.witnessproofizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getWitnessproofizabilityRollout() {
    return this.witnessproofizabilityAdminService.getWitnessproofizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceWitnessproofizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.witnessproofizabilityAdminService.getWorkspaceWitnessproofizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeWitnessproofizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: WitnessproofizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_witnessproofizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported witnessproofizability admin action.',
      })
    }

    return this.witnessproofizabilityAdminService.executeWitnessproofizabilityAdminAction(
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
