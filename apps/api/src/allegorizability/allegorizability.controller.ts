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
import { AllegorizabilityAdminService } from './allegorizability-admin.service.js'

type AllegorizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('allegorizability')
export class AllegorizabilityController {
  constructor(
    private readonly allegorizabilityAdminService: AllegorizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.allegorizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAllegorizabilityRollout() {
    return this.allegorizabilityAdminService.getAllegorizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAllegorizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.allegorizabilityAdminService.getWorkspaceAllegorizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAllegorizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AllegorizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_allegorizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported allegorizability admin action.',
      })
    }

    return this.allegorizabilityAdminService.executeAllegorizabilityAdminAction(
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
