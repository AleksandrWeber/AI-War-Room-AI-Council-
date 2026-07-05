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
import { MemorabilityAdminService } from './memorability-admin.service.js'

type MemorabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('memorability')
export class MemorabilityController {
  constructor(
    private readonly memorabilityAdminService: MemorabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.memorabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMemorabilityRollout() {
    return this.memorabilityAdminService.getMemorabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMemorabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.memorabilityAdminService.getWorkspaceMemorabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMemorabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MemorabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_memorability_summary') {
      throw new BadRequestException({
        message: 'Unsupported memorability admin action.',
      })
    }

    return this.memorabilityAdminService.executeMemorabilityAdminAction(
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
