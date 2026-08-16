import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

const indexes = [
  ['news_date_idx', 'news', 'date DESC'],
  ['videos_category_published_at_idx', 'videos', 'category, published_at DESC'],
  ['departments_order_idx', 'departments', '"order"'],
  ['quick_links_order_idx', 'quick_links', '"order"'],
] as const

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [name, table, columns] of indexes) {
    await db.execute(`CREATE INDEX IF NOT EXISTS "${name}" ON "${table}" (${columns});`)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [name] of indexes) await db.execute(`DROP INDEX IF EXISTS "${name}";`)
}
