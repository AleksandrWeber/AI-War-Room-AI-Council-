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
import { AttestjournalizabilityAdminService } from './attestjournalizability-admin.service.js'

type AttestjournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('attestjournalizability')
export class AttestjournalizabilityController {
  constructor(
    private readonly attestjournalizabilityAdminService: AttestjournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.attestjournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAttestjournalizabilityRollout() {
    return this.attestjournalizabilityAdminService.getAttestjournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAttestjournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.attestjournalizabilityAdminService.getWorkspaceAttestjournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAttestjournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AttestjournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_attestjournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported attestjournalizability admin action.',
      })
    }

    return this.attestjournalizabilityAdminService.executeAttestjournalizabilityAdminAction(
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
