const uiModuleLoaders = import.meta.glob<Record<string, unknown>>('./*-ui.ts')

const moduleCache = new Map<string, Promise<Record<string, unknown>>>()

function normalizeModuleKey(moduleId: string): string {
  if (moduleId.startsWith('./') && moduleId.endsWith('.ts')) {
    return moduleId
  }

  const stem = moduleId.endsWith('-ui') ? moduleId : `${moduleId}-ui`
  return `./${stem}.ts`
}

export function loadUiModule(moduleId: string): Promise<Record<string, unknown>> {
  const key = normalizeModuleKey(moduleId)
  const loader = uiModuleLoaders[key]

  if (!loader) {
    throw new Error(`Unknown UI module: ${key}`)
  }

  if (!moduleCache.has(key)) {
    moduleCache.set(key, loader())
  }

  return moduleCache.get(key)!
}

export async function callUi<T>(
  moduleId: string,
  exportName: string,
  ...args: unknown[]
): Promise<T> {
  const mod = await loadUiModule(moduleId)
  const target = mod[exportName]

  if (typeof target !== 'function') {
    throw new Error(`${exportName} is not exported from ${moduleId}`)
  }

  return target(...args) as T
}
