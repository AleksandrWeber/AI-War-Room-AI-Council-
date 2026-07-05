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
import { AcceptabilityAdminService } from './acceptability-admin.service.js'

type AcceptabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('acceptability')
export class AcceptabilityController {
  constructor(
    private readonly acceptabilityAdminService: AcceptabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.acceptabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAcceptabilityRollout() {
    return this.acceptabilityAdminService.getAcceptabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAcceptabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.acceptabilityAdminService.getWorkspaceAcceptabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAcceptabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AcceptabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_acceptability_summary') {
      throw new BadRequestException({
        message: 'Unsupported acceptability admin action.',
      })
    }

    return this.acceptabilityAdminService.executeAcceptabilityAdminAction(
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
