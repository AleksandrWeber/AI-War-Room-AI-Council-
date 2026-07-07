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
import { RegistrationizabilityAdminService } from './registrationizability-admin.service.js'

type RegistrationizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('registrationizability')
export class RegistrationizabilityController {
  constructor(
    private readonly registrationizabilityAdminService: RegistrationizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.registrationizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRegistrationizabilityRollout() {
    return this.registrationizabilityAdminService.getRegistrationizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRegistrationizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.registrationizabilityAdminService.getWorkspaceRegistrationizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRegistrationizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RegistrationizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_registrationizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported registrationizability admin action.',
      })
    }

    return this.registrationizabilityAdminService.executeRegistrationizabilityAdminAction(
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
