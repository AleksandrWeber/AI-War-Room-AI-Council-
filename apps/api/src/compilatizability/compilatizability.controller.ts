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
import { CompilatizabilityAdminService } from './compilatizability-admin.service.js'

type CompilatizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('compilatizability')
export class CompilatizabilityController {
  constructor(
    private readonly compilatizabilityAdminService: CompilatizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.compilatizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCompilatizabilityRollout() {
    return this.compilatizabilityAdminService.getCompilatizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCompilatizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.compilatizabilityAdminService.getWorkspaceCompilatizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCompilatizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CompilatizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_compilatizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported compilatizability admin action.',
      })
    }

    return this.compilatizabilityAdminService.executeCompilatizabilityAdminAction(
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
