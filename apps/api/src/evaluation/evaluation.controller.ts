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
import { EvaluationAdminService } from './evaluation-admin.service.js'

type PromptRegressionAdminBody = {
  workspaceId?: unknown
  action?: unknown
}

@Controller('evaluation')
export class EvaluationController {
  constructor(private readonly evaluationAdminService: EvaluationAdminService) {}

  @Get('capabilities')
  getCapabilities() {
    return this.evaluationAdminService.getCapabilities()
  }

  @Get('readiness')
  getPromptEvaluationRollout() {
    return this.evaluationAdminService.getPromptEvaluationRollout()
  }

  @Get('workspace/:workspaceId/admin')
  @UseGuards(WorkspaceAccessGuard)
  getWorkspacePromptRegressionAdminSummary(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    return this.evaluationAdminService.getWorkspacePromptRegressionAdminSummary(
      request.authContext!,
      workspaceId,
    )
  }

  @Post('workspace/:workspaceId/admin/actions')
  @UseGuards(WorkspaceAccessGuard)
  executePromptRegressionAdminAction(
    @Param('workspaceId') workspaceId: string,
    @Req() request: AuthenticatedRequest,
    @Body() body: PromptRegressionAdminBody,
  ) {
    this.assertWorkspaceParam(request, workspaceId)

    const action = body.action

    if (action !== 'rerun_prompt_regression') {
      throw new BadRequestException({
        message: 'Unsupported prompt regression admin action.',
      })
    }

    return this.evaluationAdminService.executePromptRegressionAdminAction(
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
