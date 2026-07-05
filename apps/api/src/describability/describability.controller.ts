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
import { DescribabilityAdminService } from './describability-admin.service.js'

type DescribabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('describability')
export class DescribabilityController {
  constructor(
    private readonly describabilityAdminService: DescribabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.describabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getDescribabilityRollout() {
    return this.describabilityAdminService.getDescribabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceDescribabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.describabilityAdminService.getWorkspaceDescribabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeDescribabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: DescribabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_describability_summary') {
      throw new BadRequestException({
        message: 'Unsupported describability admin action.',
      })
    }

    return this.describabilityAdminService.executeDescribabilityAdminAction(
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
