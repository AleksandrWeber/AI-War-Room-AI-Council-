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
import { ExpressivenessAdminService } from './expressiveness-admin.service.js'

type ExpressivenessAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('expressiveness')
export class ExpressivenessController {
  constructor(
    private readonly expressivenessAdminService: ExpressivenessAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.expressivenessAdminService.getCapabilities()
  }

  @Get('readiness')
  async getExpressivenessRollout() {
    return this.expressivenessAdminService.getExpressivenessRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceExpressivenessAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.expressivenessAdminService.getWorkspaceExpressivenessAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeExpressivenessAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ExpressivenessAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_expressiveness_summary') {
      throw new BadRequestException({
        message: 'Unsupported expressiveness admin action.',
      })
    }

    return this.expressivenessAdminService.executeExpressivenessAdminAction(
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
