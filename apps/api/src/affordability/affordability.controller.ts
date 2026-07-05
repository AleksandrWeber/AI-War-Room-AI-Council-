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
import { AffordabilityAdminService } from './affordability-admin.service.js'

type AffordabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('affordability')
export class AffordabilityController {
  constructor(
    private readonly affordabilityAdminService: AffordabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.affordabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getAffordabilityRollout() {
    return this.affordabilityAdminService.getAffordabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceAffordabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.affordabilityAdminService.getWorkspaceAffordabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeAffordabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: AffordabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_affordability_summary') {
      throw new BadRequestException({
        message: 'Unsupported affordability admin action.',
      })
    }

    return this.affordabilityAdminService.executeAffordabilityAdminAction(
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
