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
import { FootnotizabilityAdminService } from './footnotizability-admin.service.js'

type FootnotizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('footnotizability')
export class FootnotizabilityController {
  constructor(
    private readonly footnotizabilityAdminService: FootnotizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.footnotizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFootnotizabilityRollout() {
    return this.footnotizabilityAdminService.getFootnotizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFootnotizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.footnotizabilityAdminService.getWorkspaceFootnotizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFootnotizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FootnotizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_footnotizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported footnotizability admin action.',
      })
    }

    return this.footnotizabilityAdminService.executeFootnotizabilityAdminAction(
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
