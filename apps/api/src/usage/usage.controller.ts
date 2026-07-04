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
import { UsageService } from './usage.service.js'

type UsageWorkspaceBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('usage')
export class UsageController {
  constructor(private readonly usageService: UsageService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.usageService.getCapabilities()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspaceUsageAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.usageService.getWorkspaceUsageAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  executeUsageAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: UsageWorkspaceBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    if (body.action !== 'reset_daily_usage') {
      throw new BadRequestException({
        message: 'Unsupported usage admin action.',
      })
    }

    return this.usageService.executeUsageAdminAction(request.authContext!, {
      workspaceId,
      action: body.action,
    })
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
