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
import { RepeatabilityvaultizabilityAdminService } from './repeatabilityvaultizability-admin.service.js'

type RepeatabilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('repeatabilityvaultizability')
export class RepeatabilityvaultizabilityController {
  constructor(
    private readonly repeatabilityvaultizabilityAdminService: RepeatabilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.repeatabilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRepeatabilityvaultizabilityRollout() {
    return this.repeatabilityvaultizabilityAdminService.getRepeatabilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRepeatabilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.repeatabilityvaultizabilityAdminService.getWorkspaceRepeatabilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRepeatabilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RepeatabilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_repeatabilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported repeatabilityvaultizability admin action.',
      })
    }

    return this.repeatabilityvaultizabilityAdminService.executeRepeatabilityvaultizabilityAdminAction(
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
