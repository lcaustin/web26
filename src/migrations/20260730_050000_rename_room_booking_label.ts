import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`UPDATE quick_links SET name_ko = '장소 예약' WHERE href = '/room-booking'`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(`UPDATE quick_links SET name_ko = '공간 예약' WHERE href = '/room-booking'`)
}
