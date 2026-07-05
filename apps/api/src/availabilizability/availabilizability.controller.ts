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
import { AvailabilizabilityAdminService } from './availabilizability-admin.service.js'

type AvailabilizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('availabilizability')
export class AvailabilizabilityController {
  constructor(
    private readonly availabilizabilityAdminService: AvailabilizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.availabilizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAvailabilizabilityRollout() {
    return this.availabilizabilityAdminService.getAvailabilizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAvailabilizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.availabilizabilityAdminService.getWorkspaceAvailabilizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAvailabilizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AvailabilizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_availabilizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported availabilizability admin action.',
      })
    }

    return this.availabilizabilityAdminService.executeAvailabilizabilityAdminAction(
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
