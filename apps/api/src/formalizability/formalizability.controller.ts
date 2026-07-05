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
import { FormalizabilityAdminService } from './formalizability-admin.service.js'

type FormalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('formalizability')
export class FormalizabilityController {
  constructor(
    private readonly formalizabilityAdminService: FormalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.formalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getFormalizabilityRollout() {
    return this.formalizabilityAdminService.getFormalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceFormalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.formalizabilityAdminService.getWorkspaceFormalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeFormalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: FormalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_formalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported formalizability admin action.',
      })
    }

    return this.formalizabilityAdminService.executeFormalizabilityAdminAction(
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
