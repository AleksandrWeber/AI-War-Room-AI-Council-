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
import { InterchangeabilityAdminService } from './interchangeability-admin.service.js'

type InterchangeabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('interchangeability')
export class InterchangeabilityController {
  constructor(
    private readonly interchangeabilityAdminService: InterchangeabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.interchangeabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInterchangeabilityRollout() {
    return this.interchangeabilityAdminService.getInterchangeabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInterchangeabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.interchangeabilityAdminService.getWorkspaceInterchangeabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInterchangeabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InterchangeabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_interchangeability_summary') {
      throw new BadRequestException({
        message: 'Unsupported interchangeability admin action.',
      })
    }

    return this.interchangeabilityAdminService.executeInterchangeabilityAdminAction(
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
