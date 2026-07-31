import type { MigrateDownArgs, MigrateUpArgs } from '@payloadcms/db-postgres'

const rooms = [
  ['다목적 예배실', 'Multi-purpose Hall'], ['대예배실', 'Main Sanctuary'], ['유스 예배실', 'Youth Sanctuary'], ['EM 예배실', 'EM Sanctuary'], ['초등부 예배실', 'Elementary Sanctuary'], ['유아부 예배실', 'Preschool Sanctuary'], ['영아부 예배실', 'Nursery Sanctuary'],
  ...Array.from({ length: 5 }, (_, i) => [`Room 10${i + 1}`, `Room 10${i + 1}`]), ...Array.from({ length: 5 }, (_, i) => [`Room 20${i + 1}`, `Room 20${i + 1}`]),
]

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(`CREATE TABLE IF NOT EXISTS rooms (id serial PRIMARY KEY, name_ko varchar NOT NULL, name_en varchar NOT NULL, "order" numeric DEFAULT 0, active boolean NOT NULL DEFAULT true, updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now());`)
  await db.execute(`CREATE TABLE IF NOT EXISTS room_reservations (id serial PRIMARY KEY, admin_title varchar, room_id integer NOT NULL REFERENCES rooms(id), date timestamptz NOT NULL, start_time varchar NOT NULL, end_time varchar NOT NULL, name varchar NOT NULL, purpose varchar NOT NULL, email varchar NOT NULL, phone varchar NOT NULL, status varchar NOT NULL DEFAULT 'waiting', updated_at timestamptz NOT NULL DEFAULT now(), created_at timestamptz NOT NULL DEFAULT now());`)
  for (let i = 0; i < rooms.length; i++) {
    const ko = rooms[i][0].replaceAll("'", "''")
    const en = rooms[i][1].replaceAll("'", "''")
    await db.execute(`INSERT INTO rooms (name_ko, name_en, "order") SELECT '${ko}', '${en}', ${i} WHERE NOT EXISTS (SELECT 1 FROM rooms WHERE name_ko = '${ko}')`)
  }
  await db.execute(`CREATE INDEX IF NOT EXISTS room_reservations_date_idx ON room_reservations (room_id, date, status);`)
  await db.execute(`INSERT INTO quick_links (name_ko, name_en, icon, href, "order", updated_at, created_at) SELECT '공간 예약', 'Room Booking', 'ti-calendar-event', '/room-booking', 50, now(), now() WHERE NOT EXISTS (SELECT 1 FROM quick_links WHERE href = '/room-booking')`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> { await db.execute('DROP TABLE IF EXISTS room_reservations; DROP TABLE IF EXISTS rooms;') }
