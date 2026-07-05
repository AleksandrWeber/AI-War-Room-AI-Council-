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
import { CategorizabilityAdminService } from './categorizability-admin.service.js'

type CategorizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('categorizability')
export class CategorizabilityController {
  constructor(
    private readonly categorizabilityAdminService: CategorizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.categorizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCategorizabilityRollout() {
    return this.categorizabilityAdminService.getCategorizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCategorizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.categorizabilityAdminService.getWorkspaceCategorizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCategorizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CategorizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_categorizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported categorizability admin action.',
      })
    }

    return this.categorizabilityAdminService.executeCategorizabilityAdminAction(
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
