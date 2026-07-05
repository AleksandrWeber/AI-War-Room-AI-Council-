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
import { ParsabilityAdminService } from './parsability-admin.service.js'

type ParsabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('parsability')
export class ParsabilityController {
  constructor(
    private readonly parsabilityAdminService: ParsabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.parsabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getParsabilityRollout() {
    return this.parsabilityAdminService.getParsabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceParsabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.parsabilityAdminService.getWorkspaceParsabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeParsabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ParsabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_parsability_summary') {
      throw new BadRequestException({
        message: 'Unsupported parsability admin action.',
      })
    }

    return this.parsabilityAdminService.executeParsabilityAdminAction(
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
