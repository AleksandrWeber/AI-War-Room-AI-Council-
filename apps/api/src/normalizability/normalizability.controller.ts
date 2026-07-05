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
import { NormalizabilityAdminService } from './normalizability-admin.service.js'

type NormalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('normalizability')
export class NormalizabilityController {
  constructor(
    private readonly normalizabilityAdminService: NormalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.normalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNormalizabilityRollout() {
    return this.normalizabilityAdminService.getNormalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNormalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.normalizabilityAdminService.getWorkspaceNormalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNormalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NormalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_normalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported normalizability admin action.',
      })
    }

    return this.normalizabilityAdminService.executeNormalizabilityAdminAction(
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
