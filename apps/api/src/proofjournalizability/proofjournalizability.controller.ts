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
import { ProofjournalizabilityAdminService } from './proofjournalizability-admin.service.js'

type ProofjournalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('proofjournalizability')
export class ProofjournalizabilityController {
  constructor(
    private readonly proofjournalizabilityAdminService: ProofjournalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.proofjournalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getProofjournalizabilityRollout() {
    return this.proofjournalizabilityAdminService.getProofjournalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceProofjournalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.proofjournalizabilityAdminService.getWorkspaceProofjournalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeProofjournalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ProofjournalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_proofjournalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported proofjournalizability admin action.',
      })
    }

    return this.proofjournalizabilityAdminService.executeProofjournalizabilityAdminAction(
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
