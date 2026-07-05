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
import { CorroborizabilityAdminService } from './corroborizability-admin.service.js'

type CorroborizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('corroborizability')
export class CorroborizabilityController {
  constructor(
    private readonly corroborizabilityAdminService: CorroborizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.corroborizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getCorroborizabilityRollout() {
    return this.corroborizabilityAdminService.getCorroborizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceCorroborizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.corroborizabilityAdminService.getWorkspaceCorroborizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeCorroborizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: CorroborizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_corroborizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported corroborizability admin action.',
      })
    }

    return this.corroborizabilityAdminService.executeCorroborizabilityAdminAction(
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
