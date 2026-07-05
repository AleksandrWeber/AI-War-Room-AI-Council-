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
import { LexicalizabilityAdminService } from './lexicalizability-admin.service.js'

type LexicalizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('lexicalizability')
export class LexicalizabilityController {
  constructor(
    private readonly lexicalizabilityAdminService: LexicalizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.lexicalizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getLexicalizabilityRollout() {
    return this.lexicalizabilityAdminService.getLexicalizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceLexicalizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.lexicalizabilityAdminService.getWorkspaceLexicalizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeLexicalizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: LexicalizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_lexicalizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported lexicalizability admin action.',
      })
    }

    return this.lexicalizabilityAdminService.executeLexicalizabilityAdminAction(
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
