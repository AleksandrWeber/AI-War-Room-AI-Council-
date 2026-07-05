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
import { NcompactionizabilityAdminService } from './ncompactionizability-admin.service.js'

type NcompactionizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('ncompactionizability')
export class NcompactionizabilityController {
  constructor(
    private readonly ncompactionizabilityAdminService: NcompactionizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.ncompactionizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNcompactionizabilityRollout() {
    return this.ncompactionizabilityAdminService.getNcompactionizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNcompactionizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.ncompactionizabilityAdminService.getWorkspaceNcompactionizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNcompactionizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NcompactionizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_ncompactionizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported ncompactionizability admin action.',
      })
    }

    return this.ncompactionizabilityAdminService.executeNcompactionizabilityAdminAction(
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
