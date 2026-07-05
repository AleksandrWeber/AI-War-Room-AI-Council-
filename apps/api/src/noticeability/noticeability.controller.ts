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
import { NoticeabilityAdminService } from './noticeability-admin.service.js'

type NoticeabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('noticeability')
export class NoticeabilityController {
  constructor(
    private readonly noticeabilityAdminService: NoticeabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.noticeabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getNoticeabilityRollout() {
    return this.noticeabilityAdminService.getNoticeabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceNoticeabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.noticeabilityAdminService.getWorkspaceNoticeabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeNoticeabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: NoticeabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_noticeability_summary') {
      throw new BadRequestException({
        message: 'Unsupported noticeability admin action.',
      })
    }

    return this.noticeabilityAdminService.executeNoticeabilityAdminAction(
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
