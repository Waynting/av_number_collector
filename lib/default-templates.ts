/**
 * Default source templates available to all users
 * These templates provide instant access to popular AV sites without requiring manual setup
 */

export interface DefaultTemplate {
  id: string
  name: string
  baseTemplate: string
  isDefault: boolean
  isBuiltIn: true // Flag to distinguish from user templates
}

export const DEFAULT_TEMPLATES: DefaultTemplate[] = [
  {
    id: 'default-missav',
    name: 'MissAV',
    baseTemplate: 'https://missav.ws/{code}',
    isDefault: true,
    isBuiltIn: true,
  },
  {
    id: 'default-jable',
    name: 'Jable',
    baseTemplate: 'https://jable.tv/videos/{code}/',
    isDefault: false,
    isBuiltIn: true,
  },
  {
    id: 'default-javdb',
    name: 'JAVDB',
    baseTemplate: 'https://javdb.com/search?q={code}',
    isDefault: false,
    isBuiltIn: true,
  },
  {
    id: 'default-javlibrary',
    name: 'JavLibrary',
    baseTemplate: 'https://www.javlibrary.com/en/vl_searchbyid.php?keyword={code}',
    isDefault: false,
    isBuiltIn: true,
  },
  {
    id: 'default-sukebei',
    name: 'Sukebei',
    baseTemplate: 'https://sukebei.nyaa.si/?q={code}',
    isDefault: false,
    isBuiltIn: true,
  },
]

/**
 * Get all available templates by merging default templates with user templates
 * User templates take priority - if a user has set a default, it overrides the built-in default
 */
export function mergeTemplates<T extends { id: string; name: string; baseTemplate: string; isDefault: boolean }>(
  userTemplates: T[]
): (T | DefaultTemplate)[] {
  // If user has any default template, make all built-in templates non-default
  const hasUserDefault = userTemplates.some(t => t.isDefault)

  const adjustedDefaults = hasUserDefault
    ? DEFAULT_TEMPLATES.map(t => ({ ...t, isDefault: false }))
    : DEFAULT_TEMPLATES

  // Merge: user templates first, then default templates
  return [...userTemplates, ...adjustedDefaults]
}

/**
 * Get a specific default template by name
 */
export function getDefaultTemplate(name: string): DefaultTemplate | undefined {
  return DEFAULT_TEMPLATES.find(t => t.name.toLowerCase() === name.toLowerCase())
}

/**
 * Check if a template is a built-in default
 */
export function isDefaultTemplate(templateId: string): boolean {
  return templateId.startsWith('default-')
}
