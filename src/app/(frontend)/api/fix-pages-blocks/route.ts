import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

export async function GET() {
  try {
    const payload = await getPayload({ config })
    // @ts-ignore — access drizzle adapter internals
    const db = payload.db.drizzle

    const results: string[] = []

    // ── Step 1: Check _path type in pages_blocks_photo_grid ───────────────
    const existsRes = await db.execute(
      `SELECT to_regclass('public."pages_blocks_photo_grid"') IS NOT NULL AS "exists"`
    )
    const tableExists = existsRes.rows[0]?.exists

    if (tableExists) {
      const colRes = await db.execute(`
        SELECT data_type FROM information_schema.columns
        WHERE table_name = 'pages_blocks_photo_grid' AND column_name = '_path'
      `)
      const dtype = colRes.rows[0]?.data_type
      results.push(`pages_blocks_photo_grid._path type: ${dtype}`)

      if (dtype && dtype !== 'text' && dtype !== 'character varying') {
        await db.execute(`DROP TABLE IF EXISTS "pages_blocks_photo_grid" CASCADE`)
        await db.execute(`DROP TABLE IF EXISTS "pages_blocks_photo_grid_images" CASCADE`)
        results.push('pages_blocks_photo_grid: dropped (bad _path type) + images subtable')
      } else {
        results.push('pages_blocks_photo_grid: _path is already text — no action')
        return NextResponse.json({ ok: true, results })
      }
    } else {
      results.push('pages_blocks_photo_grid: table not found — will push schema')
    }

    // ── Step 2: Manually recreate the tables with correct types ──────────
    try {
      const pagesIdRes = await db.execute(`
        SELECT data_type, udt_name FROM information_schema.columns
        WHERE table_name = 'pages' AND column_name = 'id'
      `)
      const pagesIdType = pagesIdRes.rows[0]?.data_type ?? 'integer'
      const parentRefType = pagesIdType === 'integer' ? 'integer' : 'varchar(255)'
      results.push(`pages.id type: ${pagesIdType} → using ${parentRefType} for _parent_id`)

      await db.execute(`
        CREATE TABLE "pages_blocks_photo_grid" (
          "_order"      integer         NOT NULL,
          "_parent_id"  ${parentRefType} NOT NULL,
          "_path"       text            NOT NULL,
          "id"          varchar(255)    PRIMARY KEY,
          "block_name"  varchar(255),
          CONSTRAINT "pages_blocks_photo_grid_parent_id_fk"
            FOREIGN KEY ("_parent_id") REFERENCES "pages"("id") ON DELETE CASCADE
        )
      `)
      await db.execute(`CREATE INDEX ON "pages_blocks_photo_grid" ("_order")`)
      await db.execute(`CREATE INDEX ON "pages_blocks_photo_grid" ("_parent_id")`)
      await db.execute(`CREATE INDEX ON "pages_blocks_photo_grid" ("_path")`)
      results.push('pages_blocks_photo_grid: created with _path text')

      await db.execute(`
        CREATE TABLE "pages_blocks_photo_grid_images" (
          "_order"      integer        NOT NULL,
          "_parent_id"  varchar(255)   NOT NULL,
          "id"          varchar(255)   PRIMARY KEY,
          "image_id"    ${parentRefType},
          CONSTRAINT "pages_blocks_photo_grid_images_parent_fk"
            FOREIGN KEY ("_parent_id") REFERENCES "pages_blocks_photo_grid"("id") ON DELETE CASCADE
        )
      `)
      await db.execute(`CREATE INDEX ON "pages_blocks_photo_grid_images" ("_order")`)
      await db.execute(`CREATE INDEX ON "pages_blocks_photo_grid_images" ("_parent_id")`)
      results.push('pages_blocks_photo_grid_images: created')
    } catch (createErr: any) {
      results.push(`create error: ${createErr.message}`)
    }

    return NextResponse.json({ ok: true, results })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
