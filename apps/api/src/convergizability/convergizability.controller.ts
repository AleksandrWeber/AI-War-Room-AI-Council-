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
import { ConvergizabilityAdminService } from './convergizability-admin.service.js'

type ConvergizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('convergizability')
export class ConvergizabilityController {
  constructor(
    private readonly convergizabilityAdminService: ConvergizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.convergizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getConvergizabilityRollout() {
    return this.convergizabilityAdminService.getConvergizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceConvergizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.convergizabilityAdminService.getWorkspaceConvergizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeConvergizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ConvergizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_convergizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported convergizability admin action.',
      })
    }

    return this.convergizabilityAdminService.executeConvergizabilityAdminAction(
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
