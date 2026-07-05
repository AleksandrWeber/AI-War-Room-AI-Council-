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
import { AttestationAdminService } from './attestation-admin.service.js'

type AttestationAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('attestation')
export class AttestationController {
  constructor(
    private readonly attestationAdminService: AttestationAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.attestationAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAttestationRollout() {
    return this.attestationAdminService.getAttestationRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAttestationAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.attestationAdminService.getWorkspaceAttestationAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAttestationAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AttestationAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_attestation_summary') {
      throw new BadRequestException({
        message: 'Unsupported attestation admin action.',
      })
    }

    return this.attestationAdminService.executeAttestationAdminAction(
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
