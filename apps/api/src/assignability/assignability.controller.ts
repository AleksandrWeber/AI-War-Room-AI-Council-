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
import { AssignabilityAdminService } from './assignability-admin.service.js'

type AssignabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('assignability')
export class AssignabilityController {
  constructor(
    private readonly assignabilityAdminService: AssignabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.assignabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAssignabilityRollout() {
    return this.assignabilityAdminService.getAssignabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAssignabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.assignabilityAdminService.getWorkspaceAssignabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAssignabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AssignabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_assignability_summary') {
      throw new BadRequestException({
        message: 'Unsupported assignability admin action.',
      })
    }

    return this.assignabilityAdminService.executeAssignabilityAdminAction(
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
