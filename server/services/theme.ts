import { eq } from 'drizzle-orm'
import type { AppDatabase } from '../database/client'
import { systemSettings, type UiTheme } from '../database/schema'

export const DEFAULT_UI_THEME: UiTheme = 'mint-bento'
export const UI_THEMES: UiTheme[] = ['peach-kitchen', 'mint-bento']

export async function getUiTheme(db: AppDatabase): Promise<UiTheme> {
  const setting = (await db.select({ value: systemSettings.value })
    .from(systemSettings)
    .where(eq(systemSettings.key, 'ui_theme'))
    .limit(1))[0]
  return UI_THEMES.includes(setting?.value as UiTheme) ? setting!.value as UiTheme : DEFAULT_UI_THEME
}

export async function setUiTheme(db: AppDatabase, theme: UiTheme) {
  await db.insert(systemSettings).values({ key: 'ui_theme', value: theme })
    .onConflictDoUpdate({ target: systemSettings.key, set: { value: theme, updatedAt: new Date() } })
}
