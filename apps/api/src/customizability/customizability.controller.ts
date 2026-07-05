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
import { CustomizabilityAdminService } from './customizability-admin.service.js'

type CustomizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('customizability')
export class CustomizabilityController {
  constructor(
    private readonly customizabilityAdminService: CustomizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.customizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCustomizabilityRollout() {
    return this.customizabilityAdminService.getCustomizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCustomizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.customizabilityAdminService.getWorkspaceCustomizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCustomizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CustomizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_customizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported customizability admin action.',
      })
    }

    return this.customizabilityAdminService.executeCustomizabilityAdminAction(
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
