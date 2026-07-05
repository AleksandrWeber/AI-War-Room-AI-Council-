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
import { ComprehensibilityAdminService } from './comprehensibility-admin.service.js'

type ComprehensibilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('comprehensibility')
export class ComprehensibilityController {
  constructor(
    private readonly comprehensibilityAdminService: ComprehensibilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.comprehensibilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getComprehensibilityRollout() {
    return this.comprehensibilityAdminService.getComprehensibilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceComprehensibilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.comprehensibilityAdminService.getWorkspaceComprehensibilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeComprehensibilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ComprehensibilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_comprehensibility_summary') {
      throw new BadRequestException({
        message: 'Unsupported comprehensibility admin action.',
      })
    }

    return this.comprehensibilityAdminService.executeComprehensibilityAdminAction(
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
