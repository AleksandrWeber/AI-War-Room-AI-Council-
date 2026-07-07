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
import { FlexibilityvaultizabilityAdminService } from './flexibilityvaultizability-admin.service.js'

type FlexibilityvaultizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('flexibilityvaultizability')
export class FlexibilityvaultizabilityController {
  constructor(
    private readonly flexibilityvaultizabilityAdminService: FlexibilityvaultizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.flexibilityvaultizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFlexibilityvaultizabilityRollout() {
    return this.flexibilityvaultizabilityAdminService.getFlexibilityvaultizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFlexibilityvaultizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.flexibilityvaultizabilityAdminService.getWorkspaceFlexibilityvaultizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFlexibilityvaultizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FlexibilityvaultizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_flexibilityvaultizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported flexibilityvaultizability admin action.',
      })
    }

    return this.flexibilityvaultizabilityAdminService.executeFlexibilityvaultizabilityAdminAction(
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
