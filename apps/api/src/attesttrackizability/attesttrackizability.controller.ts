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
import { AttesttrackizabilityAdminService } from './attesttrackizability-admin.service.js'

type AttesttrackizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('attesttrackizability')
export class AttesttrackizabilityController {
  constructor(
    private readonly attesttrackizabilityAdminService: AttesttrackizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.attesttrackizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAttesttrackizabilityRollout() {
    return this.attesttrackizabilityAdminService.getAttesttrackizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAttesttrackizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.attesttrackizabilityAdminService.getWorkspaceAttesttrackizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAttesttrackizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AttesttrackizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_attesttrackizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported attesttrackizability admin action.',
      })
    }

    return this.attesttrackizabilityAdminService.executeAttesttrackizabilityAdminAction(
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
