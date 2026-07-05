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
import { PresentabilityAdminService } from './presentability-admin.service.js'

type PresentabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('presentability')
export class PresentabilityController {
  constructor(
    private readonly presentabilityAdminService: PresentabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.presentabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getPresentabilityRollout() {
    return this.presentabilityAdminService.getPresentabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspacePresentabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.presentabilityAdminService.getWorkspacePresentabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executePresentabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PresentabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_presentability_summary') {
      throw new BadRequestException({
        message: 'Unsupported presentability admin action.',
      })
    }

    return this.presentabilityAdminService.executePresentabilityAdminAction(
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
