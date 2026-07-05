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
import { RepresentabilityAdminService } from './representability-admin.service.js'

type RepresentabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('representability')
export class RepresentabilityController {
  constructor(
    private readonly representabilityAdminService: RepresentabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.representabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getRepresentabilityRollout() {
    return this.representabilityAdminService.getRepresentabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceRepresentabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.representabilityAdminService.getWorkspaceRepresentabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeRepresentabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: RepresentabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_representability_summary') {
      throw new BadRequestException({
        message: 'Unsupported representability admin action.',
      })
    }

    return this.representabilityAdminService.executeRepresentabilityAdminAction(
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
