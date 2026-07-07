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
import { AttestationizabilityAdminService } from './attestationizability-admin.service.js'

type AttestationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('attestationizability')
export class AttestationizabilityController {
  constructor(
    private readonly attestationizabilityAdminService: AttestationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.attestationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAttestationizabilityRollout() {
    return this.attestationizabilityAdminService.getAttestationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAttestationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.attestationizabilityAdminService.getWorkspaceAttestationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAttestationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AttestationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_attestationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported attestationizability admin action.',
      })
    }

    return this.attestationizabilityAdminService.executeAttestationizabilityAdminAction(
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
