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
import { FailoverizabilityAdminService } from './failoverizability-admin.service.js'

type FailoverizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('failoverizability')
export class FailoverizabilityController {
  constructor(
    private readonly failoverizabilityAdminService: FailoverizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.failoverizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFailoverizabilityRollout() {
    return this.failoverizabilityAdminService.getFailoverizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFailoverizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.failoverizabilityAdminService.getWorkspaceFailoverizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFailoverizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FailoverizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_failoverizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported failoverizability admin action.',
      })
    }

    return this.failoverizabilityAdminService.executeFailoverizabilityAdminAction(
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
