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
import { AppendizabilityAdminService } from './appendizability-admin.service.js'

type AppendizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('appendizability')
export class AppendizabilityController {
  constructor(
    private readonly appendizabilityAdminService: AppendizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.appendizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAppendizabilityRollout() {
    return this.appendizabilityAdminService.getAppendizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAppendizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.appendizabilityAdminService.getWorkspaceAppendizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAppendizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AppendizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_appendizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported appendizability admin action.',
      })
    }

    return this.appendizabilityAdminService.executeAppendizabilityAdminAction(
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
