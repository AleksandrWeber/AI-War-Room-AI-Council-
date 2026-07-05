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
import { MemorizabilityAdminService } from './memorizability-admin.service.js'

type MemorizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('memorizability')
export class MemorizabilityController {
  constructor(
    private readonly memorizabilityAdminService: MemorizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.memorizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMemorizabilityRollout() {
    return this.memorizabilityAdminService.getMemorizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMemorizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.memorizabilityAdminService.getWorkspaceMemorizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMemorizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MemorizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_memorizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported memorizability admin action.',
      })
    }

    return this.memorizabilityAdminService.executeMemorizabilityAdminAction(
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
