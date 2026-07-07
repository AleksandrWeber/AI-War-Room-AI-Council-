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
import { AttestationvaultizabilityAdminService } from './attestationvaultizability-admin.service.js'

type AttestationvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('attestationvaultizability')
export class AttestationvaultizabilityController {
  constructor(
    private readonly attestationvaultizabilityAdminService: AttestationvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.attestationvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAttestationvaultizabilityRollout() {
    return this.attestationvaultizabilityAdminService.getAttestationvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAttestationvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.attestationvaultizabilityAdminService.getWorkspaceAttestationvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAttestationvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AttestationvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_attestationvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported attestationvaultizability admin action.',
      })
    }

    return this.attestationvaultizabilityAdminService.executeAttestationvaultizabilityAdminAction(
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
