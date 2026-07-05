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
import { ResilientizabilityAdminService } from './resilientizability-admin.service.js'

type ResilientizabilityAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('resilientizability')
export class ResilientizabilityController {
  constructor(
    private readonly resilientizabilityAdminService: ResilientizabilityAdminService,
  ) {}

  @Get('capabilities')
  getCapabilities() {
    return this.resilientizabilityAdminService.getCapabilities()
  }

  @Get('readiness')
  async getResilientizabilityRollout() {
    return this.resilientizabilityAdminService.getResilientizabilityRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  async getWorkspaceResilientizabilityAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.resilientizabilityAdminService.getWorkspaceResilientizabilityAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  async executeResilientizabilityAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: ResilientizabilityAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'refresh_resilientizability_summary') {
      throw new BadRequestException({
        message: 'Unsupported resilientizability admin action.',
      })
    }

    return this.resilientizabilityAdminService.executeResilientizabilityAdminAction(
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
