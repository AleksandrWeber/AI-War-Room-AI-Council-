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
import { MetaphorizabilityAdminService } from './metaphorizability-admin.service.js'

type MetaphorizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('metaphorizability')
export class MetaphorizabilityController {
  constructor(
    private readonly metaphorizabilityAdminService: MetaphorizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.metaphorizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getMetaphorizabilityRollout() {
    return this.metaphorizabilityAdminService.getMetaphorizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceMetaphorizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.metaphorizabilityAdminService.getWorkspaceMetaphorizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeMetaphorizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: MetaphorizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_metaphorizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported metaphorizability admin action.',
      })
    }

    return this.metaphorizabilityAdminService.executeMetaphorizabilityAdminAction(
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
