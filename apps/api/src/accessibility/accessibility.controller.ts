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
import { AccessibilityAdminService } from './accessibility-admin.service.js'

type AccessibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('accessibility')
export class AccessibilityController {
  constructor(
    private readonly accessibilityAdminService: AccessibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.accessibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAccessibilityRollout() {
    return this.accessibilityAdminService.getAccessibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAccessibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.accessibilityAdminService.getWorkspaceAccessibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAccessibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AccessibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_accessibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported accessibility admin action.',
      })
    }

    return this.accessibilityAdminService.executeAccessibilityAdminAction(
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
