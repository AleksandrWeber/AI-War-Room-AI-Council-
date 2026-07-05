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
import { MethodizabilityAdminService } from './methodizability-admin.service.js'

type MethodizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('methodizability')
export class MethodizabilityController {
  constructor(
    private readonly methodizabilityAdminService: MethodizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.methodizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMethodizabilityRollout() {
    return this.methodizabilityAdminService.getMethodizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMethodizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.methodizabilityAdminService.getWorkspaceMethodizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMethodizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MethodizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_methodizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported methodizability admin action.',
      })
    }

    return this.methodizabilityAdminService.executeMethodizabilityAdminAction(
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
