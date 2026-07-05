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
import { AbductizabilityAdminService } from './abductizability-admin.service.js'

type AbductizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('abductizability')
export class AbductizabilityController {
  constructor(
    private readonly abductizabilityAdminService: AbductizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.abductizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAbductizabilityRollout() {
    return this.abductizabilityAdminService.getAbductizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAbductizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.abductizabilityAdminService.getWorkspaceAbductizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAbductizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AbductizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_abductizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported abductizability admin action.',
      })
    }

    return this.abductizabilityAdminService.executeAbductizabilityAdminAction(
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
