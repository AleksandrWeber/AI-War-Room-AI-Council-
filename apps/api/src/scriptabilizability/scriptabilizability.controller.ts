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
import { ScriptabilizabilityAdminService } from './scriptabilizability-admin.service.js'

type ScriptabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('scriptabilizability')
export class ScriptabilizabilityController {
  constructor(
    private readonly scriptabilizabilityAdminService: ScriptabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.scriptabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getScriptabilizabilityRollout() {
    return this.scriptabilizabilityAdminService.getScriptabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceScriptabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.scriptabilizabilityAdminService.getWorkspaceScriptabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeScriptabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ScriptabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_scriptabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported scriptabilizability admin action.',
      })
    }

    return this.scriptabilizabilityAdminService.executeScriptabilizabilityAdminAction(
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
