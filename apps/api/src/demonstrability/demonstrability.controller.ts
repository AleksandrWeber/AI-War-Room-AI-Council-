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
import { DemonstrabilityAdminService } from './demonstrability-admin.service.js'

type DemonstrabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('demonstrability')
export class DemonstrabilityController {
  constructor(
    private readonly demonstrabilityAdminService: DemonstrabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.demonstrabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDemonstrabilityRollout() {
    return this.demonstrabilityAdminService.getDemonstrabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDemonstrabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.demonstrabilityAdminService.getWorkspaceDemonstrabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDemonstrabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DemonstrabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_demonstrability_summary') {
      throw new BadRequestException({
        message: 'Unsupported demonstrability admin action.',
      })
    }

    return this.demonstrabilityAdminService.executeDemonstrabilityAdminAction(
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
