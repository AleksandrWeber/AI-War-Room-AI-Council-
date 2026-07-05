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
import { CoherenceAdminService } from './coherence-admin.service.js'

type CoherenceAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('coherence')
export class CoherenceController {
  constructor(
    private readonly coherenceAdminService: CoherenceAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.coherenceAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCoherenceRollout() {
    return this.coherenceAdminService.getCoherenceRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCoherenceAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.coherenceAdminService.getWorkspaceCoherenceAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCoherenceAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CoherenceAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_coherence_summary') {
      throw new BadRequestException({
        message: 'Unsupported coherence admin action.',
      })
    }

    return this.coherenceAdminService.executeCoherenceAdminAction(
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
