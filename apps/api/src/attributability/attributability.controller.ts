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
import { AttributabilityAdminService } from './attributability-admin.service.js'

type AttributabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('attributability')
export class AttributabilityController {
  constructor(
    private readonly attributabilityAdminService: AttributabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.attributabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAttributabilityRollout() {
    return this.attributabilityAdminService.getAttributabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAttributabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.attributabilityAdminService.getWorkspaceAttributabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAttributabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AttributabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_attributability_summary') {
      throw new BadRequestException({
        message: 'Unsupported attributability admin action.',
      })
    }

    return this.attributabilityAdminService.executeAttributabilityAdminAction(
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
