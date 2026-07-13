import { expect, test } from '@playwright/test'

const idea =
  'Build an AI War Room SaaS that turns founder ideas into PRDs and development prompts.'

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
