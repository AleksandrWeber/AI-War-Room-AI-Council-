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
import { InterpretabilityAdminService } from './interpretability-admin.service.js'

type InterpretabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('interpretability')
export class InterpretabilityController {
  constructor(
    private readonly interpretabilityAdminService: InterpretabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.interpretabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getInterpretabilityRollout() {
    return this.interpretabilityAdminService.getInterpretabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceInterpretabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.interpretabilityAdminService.getWorkspaceInterpretabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeInterpretabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: InterpretabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_interpretability_summary') {
      throw new BadRequestException({
        message: 'Unsupported interpretability admin action.',
      })
    }

    return this.interpretabilityAdminService.executeInterpretabilityAdminAction(
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
