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
import { SandboxizabilityAdminService } from './sandboxizability-admin.service.js'

type SandboxizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('sandboxizability')
export class SandboxizabilityController {
  constructor(
    private readonly sandboxizabilityAdminService: SandboxizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.sandboxizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getSandboxizabilityRollout() {
    return this.sandboxizabilityAdminService.getSandboxizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceSandboxizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.sandboxizabilityAdminService.getWorkspaceSandboxizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeSandboxizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: SandboxizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_sandboxizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported sandboxizability admin action.',
      })
    }

    return this.sandboxizabilityAdminService.executeSandboxizabilityAdminAction(
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
