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
import { NackizabilityAdminService } from './nackizability-admin.service.js'

type NackizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('nackizability')
export class NackizabilityController {
  constructor(
    private readonly nackizabilityAdminService: NackizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.nackizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNackizabilityRollout() {
    return this.nackizabilityAdminService.getNackizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNackizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.nackizabilityAdminService.getWorkspaceNackizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNackizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NackizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_nackizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported nackizability admin action.',
      })
    }

    return this.nackizabilityAdminService.executeNackizabilityAdminAction(
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
