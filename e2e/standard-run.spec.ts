import { expect, test } from '@playwright/test'

const idea =
  'Build an AI War Room SaaS that turns founder ideas into PRDs and development prompts.'

const e2eApiUrl = `http://127.0.0.1:${process.env.E2E_API_PORT ?? '3017'}/api`

test('standard run happy path: draft, human review, mock pipeline, artifacts', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })

  await page.getByLabel('Raw idea').fill(idea)
  await page.getByRole('button', { name: 'Create draft run' }).click()

  await expect(
    page.getByRole('heading', { name: 'Approve the plan before execution.' }),
  ).toBeVisible({ timeout: 30_000 })

  const executeButton = page.getByRole('button', {
    name: 'Execute prompt-driven pipeline',
  })

  await expect(executeButton).toBeEnabled()
  await executeButton.click()

  await expect(page.getByRole('button', { name: 'Executive Summary' })).toBeVisible({
    timeout: 90_000,
  })
  await expect(page.getByRole('button', { name: 'PRD' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Development Prompt' })).toBeVisible()

  await expect(
    page.getByRole('heading', {
      name: 'Artifacts generated from isolated prompt-driven agents.',
    }),
  ).toBeVisible()
})

test('workspace invite accept via ?inviteToken= switches active workspace', async ({
  page,
  request,
}) => {
  const createResponse = await request.post(
    `${e2eApiUrl}/workspaces/local_workspace/invites`,
    {
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'user_local',
        'x-workspace-id': 'local_workspace',
      },
      data: {
        email: 'local@ai-war-room.dev',
        role: 'member',
      },
    },
  )

  expect(createResponse.ok()).toBeTruthy()
  const created = (await createResponse.json()) as {
    token: string
    inviteUrl: string
  }
  expect(created.token.length).toBeGreaterThan(16)

  await page.goto(`/?inviteToken=${encodeURIComponent(created.token)}`)

  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.getByTestId('invite-status')).toContainText(/Invite accepted/i, {
    timeout: 30_000,
  })
  await expect(page.getByTestId('invite-status')).toContainText(
    /Joined local_workspace as owner/i,
  )
  await expect(page.getByTestId('active-workspace-id')).toHaveText(
    'Active workspace: local_workspace',
  )
})

test('workspace invite reject when email does not match authenticated user', async ({
  page,
  request,
}) => {
  const createResponse = await request.post(
    `${e2eApiUrl}/workspaces/local_workspace/invites`,
    {
      headers: {
        'content-type': 'application/json',
        'x-user-id': 'user_local',
        'x-workspace-id': 'local_workspace',
      },
      data: {
        email: 'someone.else@example.com',
        role: 'viewer',
      },
    },
  )

  expect(createResponse.ok()).toBeTruthy()
  const created = (await createResponse.json()) as { token: string }

  await page.goto(`/?inviteToken=${encodeURIComponent(created.token)}`)

  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.getByTestId('invite-status')).toContainText(
    /This invite was issued for someone\.else@example\.com/i,
    { timeout: 30_000 },
  )
})

test('workspace picker switches active workspace', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.getByTestId('workspace-picker')).toBeVisible({
    timeout: 30_000,
  })

  await page.getByTestId('workspace-picker').selectOption('secondary_workspace')
  await expect(page.getByTestId('active-workspace-id')).toHaveText(
    'Active workspace: secondary_workspace',
  )

  await page.getByTestId('workspace-picker').selectOption('local_workspace')
  await expect(page.getByTestId('active-workspace-id')).toHaveText(
    'Active workspace: local_workspace',
  )
})

test('workspace picker syncs auth session and survives reload', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.getByTestId('workspace-picker')).toBeVisible({
    timeout: 30_000,
  })

  await page.getByTestId('workspace-picker').selectOption('secondary_workspace')
  await expect(page.getByTestId('active-workspace-id')).toHaveText(
    'Active workspace: secondary_workspace',
  )

  await expect
    .poll(async () => {
      return page.evaluate(() => {
        const raw = localStorage.getItem('ai-war-room.auth-session')
        if (!raw) {
          return null
        }
        try {
          return (JSON.parse(raw) as { workspaceId?: string }).workspaceId ?? null
        } catch {
          return null
        }
      })
    })
    .toBe('secondary_workspace')

  await page.reload()
  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.getByTestId('active-workspace-id')).toHaveText(
    'Active workspace: secondary_workspace',
    { timeout: 30_000 },
  )
})

test('stale active workspace recovers on boot', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem(
      'ai-war-room.active-workspace-id',
      'missing_workspace_from_storage',
    )
  })

  await page.goto('/')
  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })
  await expect(page.getByTestId('workspace-recovery-tip')).toContainText(
    /Stored workspace was unavailable/i,
    { timeout: 30_000 },
  )
  await expect(page.getByTestId('active-workspace-id')).not.toHaveText(
    'Active workspace: missing_workspace_from_storage',
  )
})

test('create workspace switches picker to the new workspace', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })

  const name = `Lab ${Date.now()}`
  await page.getByTestId('create-workspace-name').fill(name)
  await page.getByTestId('create-workspace').click()

  await expect(page.getByTestId('active-workspace-id')).not.toHaveText(
    'Active workspace: local_workspace',
    { timeout: 30_000 },
  )
  await expect(page.getByTestId('workspace-picker')).toContainText(name)
})

test('rename workspace updates the picker label', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })

  const created = `Rename ${Date.now()}`
  await page.getByTestId('create-workspace-name').fill(created)
  await page.getByTestId('create-workspace').click()
  await expect(page.getByTestId('workspace-picker')).toContainText(created, {
    timeout: 30_000,
  })

  const renamed = `${created} Renamed`
  await page.getByTestId('rename-workspace-name').fill(renamed)
  await page.getByTestId('rename-workspace').click()
  await expect(page.getByTestId('workspace-picker')).toContainText(renamed, {
    timeout: 30_000,
  })
  await expect(page.getByTestId('workspace-picker')).not.toContainText(
    `${created} (`,
  )
})

test('member leave control is visible on secondary workspace', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })
  await page.getByTestId('workspace-picker').selectOption('secondary_workspace')
  await expect(page.getByTestId('active-workspace-id')).toHaveText(
    'Active workspace: secondary_workspace',
  )
  await expect(page.getByTestId('leave-workspace')).toBeVisible({
    timeout: 30_000,
  })
})

test('sole owner cannot leave their only-owned workspace', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })
  await page.getByTestId('workspace-picker').selectOption('local_workspace')
  await expect(page.getByTestId('active-workspace-id')).toHaveText(
    'Active workspace: local_workspace',
  )
  await expect(page.getByTestId('leave-workspace')).toHaveCount(0)
})

test('archive workspace removes it from picker and recovers active', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.getByText('API status: online')).toBeVisible({
    timeout: 60_000,
  })

  const name = `Archive ${Date.now()}`
  await page.getByTestId('create-workspace-name').fill(name)
  await page.getByTestId('create-workspace').click()

  await expect(page.getByTestId('workspace-picker')).toContainText(name, {
    timeout: 30_000,
  })
  await expect(page.getByTestId('archive-workspace')).toBeVisible({
    timeout: 30_000,
  })

  const activeBefore = await page.getByTestId('active-workspace-id').innerText()
  await page.getByTestId('archive-workspace').click()

  await expect(page.getByTestId('workspace-recovery-tip')).toContainText(
    /Archived workspace/i,
    { timeout: 30_000 },
  )
  await expect(page.getByTestId('workspace-picker')).not.toContainText(name)
  await expect(page.getByTestId('active-workspace-id')).not.toHaveText(
    activeBefore,
  )
})
