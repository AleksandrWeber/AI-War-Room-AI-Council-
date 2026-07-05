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
import { TriggerizabilityAdminService } from './triggerizability-admin.service.js'

type TriggerizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('triggerizability')
export class TriggerizabilityController {
  constructor(
    private readonly triggerizabilityAdminService: TriggerizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.triggerizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getTriggerizabilityRollout() {
    return this.triggerizabilityAdminService.getTriggerizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceTriggerizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.triggerizabilityAdminService.getWorkspaceTriggerizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeTriggerizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: TriggerizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_triggerizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported triggerizability admin action.',
      })
    }

    return this.triggerizabilityAdminService.executeTriggerizabilityAdminAction(
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
