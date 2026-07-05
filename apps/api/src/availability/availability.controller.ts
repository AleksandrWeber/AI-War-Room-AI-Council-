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
import { AvailabilityAdminService } from './availability-admin.service.js'

type AvailabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('availability')
export class AvailabilityController {
  constructor(
    private readonly availabilityAdminService: AvailabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.availabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAvailabilityRollout() {
    return this.availabilityAdminService.getAvailabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAvailabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.availabilityAdminService.getWorkspaceAvailabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAvailabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AvailabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_availability_summary') {
      throw new BadRequestException({
        message: 'Unsupported availability admin action.',
      })
    }

    return this.availabilityAdminService.executeAvailabilityAdminAction(
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
