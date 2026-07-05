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
import { RepeatabilityAdminService } from './repeatability-admin.service.js'

type RepeatabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('repeatability')
export class RepeatabilityController {
  constructor(
    private readonly repeatabilityAdminService: RepeatabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.repeatabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRepeatabilityRollout() {
    return this.repeatabilityAdminService.getRepeatabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRepeatabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.repeatabilityAdminService.getWorkspaceRepeatabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRepeatabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RepeatabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_repeatability_summary') {
      throw new BadRequestException({
        message: 'Unsupported repeatability admin action.',
      })
    }

    return this.repeatabilityAdminService.executeRepeatabilityAdminAction(
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
