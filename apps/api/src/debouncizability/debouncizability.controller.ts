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
import { DebouncizabilityAdminService } from './debouncizability-admin.service.js'

type DebouncizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('debouncizability')
export class DebouncizabilityController {
  constructor(
    private readonly debouncizabilityAdminService: DebouncizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.debouncizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDebouncizabilityRollout() {
    return this.debouncizabilityAdminService.getDebouncizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDebouncizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.debouncizabilityAdminService.getWorkspaceDebouncizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDebouncizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DebouncizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_debouncizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported debouncizability admin action.',
      })
    }

    return this.debouncizabilityAdminService.executeDebouncizabilityAdminAction(
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
