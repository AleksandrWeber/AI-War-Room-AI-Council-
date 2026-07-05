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
import { ContextualizabilityAdminService } from './contextualizability-admin.service.js'

type ContextualizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('contextualizability')
export class ContextualizabilityController {
  constructor(
    private readonly contextualizabilityAdminService: ContextualizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.contextualizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getContextualizabilityRollout() {
    return this.contextualizabilityAdminService.getContextualizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceContextualizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.contextualizabilityAdminService.getWorkspaceContextualizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeContextualizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ContextualizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_contextualizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported contextualizability admin action.',
      })
    }

    return this.contextualizabilityAdminService.executeContextualizabilityAdminAction(
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
