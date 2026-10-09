import { eq } from 'drizzle-orm'
import type { AppDatabase } from '../database/client'
import { categories } from '../database/schema'

export async function assertValidCategoryParent(db: AppDatabase, parentId?: number | null, selfId?: number) {
  if (!parentId) return
  if (selfId && parentId === selfId) throw new Error('分类不能把自己当作上级')
  if (selfId) {
    const child = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, selfId)).limit(1)
    if (child[0]) throw new Error('含有子分类的一级分类不能再移动到其他分类下面')
  }
  const parent = await db.select({ id: categories.id, parentId: categories.parentId })
    .from(categories).where(eq(categories.id, parentId)).limit(1)
  if (!parent[0]) throw new Error('上级分类不存在')
  if (parent[0].parentId) throw new Error('最多只允许两级分类')
}

export function toCategoryTree<T extends { id: number, parentId: number | null }>(rows: T[]) {
  return rows.filter(row => !row.parentId).map(row => ({
    ...row,
    children: rows.filter(child => child.parentId === row.id)
  }))
}
