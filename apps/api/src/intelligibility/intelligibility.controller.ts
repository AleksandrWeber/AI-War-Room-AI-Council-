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
import { IntelligibilityAdminService } from './intelligibility-admin.service.js'

type IntelligibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('intelligibility')
export class IntelligibilityController {
  constructor(
    private readonly intelligibilityAdminService: IntelligibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.intelligibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getIntelligibilityRollout() {
    return this.intelligibilityAdminService.getIntelligibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceIntelligibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.intelligibilityAdminService.getWorkspaceIntelligibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeIntelligibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: IntelligibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_intelligibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported intelligibility admin action.',
      })
    }

    return this.intelligibilityAdminService.executeIntelligibilityAdminAction(
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
