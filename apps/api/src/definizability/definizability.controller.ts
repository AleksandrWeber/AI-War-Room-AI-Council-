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
import { DefinizabilityAdminService } from './definizability-admin.service.js'

type DefinizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('definizability')
export class DefinizabilityController {
  constructor(
    private readonly definizabilityAdminService: DefinizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.definizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDefinizabilityRollout() {
    return this.definizabilityAdminService.getDefinizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDefinizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.definizabilityAdminService.getWorkspaceDefinizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDefinizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DefinizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_definizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported definizability admin action.',
      })
    }

    return this.definizabilityAdminService.executeDefinizabilityAdminAction(
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
