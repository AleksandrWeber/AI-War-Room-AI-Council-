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
import { ResponsivenessvaultizabilityAdminService } from './responsivenessvaultizability-admin.service.js'

type ResponsivenessvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('responsivenessvaultizability')
export class ResponsivenessvaultizabilityController {
  constructor(
    private readonly responsivenessvaultizabilityAdminService: ResponsivenessvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.responsivenessvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getResponsivenessvaultizabilityRollout() {
    return this.responsivenessvaultizabilityAdminService.getResponsivenessvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceResponsivenessvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.responsivenessvaultizabilityAdminService.getWorkspaceResponsivenessvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeResponsivenessvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ResponsivenessvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_responsivenessvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported responsivenessvaultizability admin action.',
      })
    }

    return this.responsivenessvaultizabilityAdminService.executeResponsivenessvaultizabilityAdminAction(
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
