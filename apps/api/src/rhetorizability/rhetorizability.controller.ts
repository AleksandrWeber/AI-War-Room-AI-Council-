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
import { RhetorizabilityAdminService } from './rhetorizability-admin.service.js'

type RhetorizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('rhetorizability')
export class RhetorizabilityController {
  constructor(
    private readonly rhetorizabilityAdminService: RhetorizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.rhetorizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRhetorizabilityRollout() {
    return this.rhetorizabilityAdminService.getRhetorizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRhetorizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.rhetorizabilityAdminService.getWorkspaceRhetorizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRhetorizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RhetorizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_rhetorizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported rhetorizability admin action.',
      })
    }

    return this.rhetorizabilityAdminService.executeRhetorizabilityAdminAction(
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
