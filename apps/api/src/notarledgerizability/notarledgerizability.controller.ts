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
import { NotarledgerizabilityAdminService } from './notarledgerizability-admin.service.js'

type NotarledgerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('notarledgerizability')
export class NotarledgerizabilityController {
  constructor(
    private readonly notarledgerizabilityAdminService: NotarledgerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.notarledgerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNotarledgerizabilityRollout() {
    return this.notarledgerizabilityAdminService.getNotarledgerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNotarledgerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.notarledgerizabilityAdminService.getWorkspaceNotarledgerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNotarledgerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NotarledgerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_notarledgerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported notarledgerizability admin action.',
      })
    }

    return this.notarledgerizabilityAdminService.executeNotarledgerizabilityAdminAction(
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
