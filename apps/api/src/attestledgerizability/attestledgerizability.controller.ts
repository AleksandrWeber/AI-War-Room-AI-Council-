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
import { AttestledgerizabilityAdminService } from './attestledgerizability-admin.service.js'

type AttestledgerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('attestledgerizability')
export class AttestledgerizabilityController {
  constructor(
    private readonly attestledgerizabilityAdminService: AttestledgerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.attestledgerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAttestledgerizabilityRollout() {
    return this.attestledgerizabilityAdminService.getAttestledgerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAttestledgerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.attestledgerizabilityAdminService.getWorkspaceAttestledgerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAttestledgerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AttestledgerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_attestledgerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported attestledgerizability admin action.',
      })
    }

    return this.attestledgerizabilityAdminService.executeAttestledgerizabilityAdminAction(
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
