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
import { TunabilityAdminService } from './tunability-admin.service.js'

type TunabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('tunability')
export class TunabilityController {
  constructor(
    private readonly tunabilityAdminService: TunabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.tunabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTunabilityRollout() {
    return this.tunabilityAdminService.getTunabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTunabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.tunabilityAdminService.getWorkspaceTunabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTunabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TunabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_tunability_summary') {
      throw new BadRequestException({
        message: 'Unsupported tunability admin action.',
      })
    }

    return this.tunabilityAdminService.executeTunabilityAdminAction(
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
