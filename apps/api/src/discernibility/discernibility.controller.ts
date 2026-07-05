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
import { DiscernibilityAdminService } from './discernibility-admin.service.js'

type DiscernibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('discernibility')
export class DiscernibilityController {
  constructor(
    private readonly discernibilityAdminService: DiscernibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.discernibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDiscernibilityRollout() {
    return this.discernibilityAdminService.getDiscernibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDiscernibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.discernibilityAdminService.getWorkspaceDiscernibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDiscernibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DiscernibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_discernibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported discernibility admin action.',
      })
    }

    return this.discernibilityAdminService.executeDiscernibilityAdminAction(
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
