import { MigrateDownArgs, MigrateUpArgs, sql } from '@payloadcms/db-postgres'

const departmentMedia = [
  { slug: 'nursery', image: '/uploads/image/603dbe7081ab384cc11724ce.jpeg', title: '하나님의 사랑을 받고\n쑥쑥자라요', subtitle: '예수는 지혜와 키가 자라며\n하나님과 사람에게 더욱 사랑스러워 가시더라\n\n- 누가복음 2장 52절', youtube: 'https://www.youtube.com/watch?v=kYgblEIX3aI' },
  { slug: 'preschool', image: '/uploads/image/6037226e1aa7f2076ceba828.jpeg', title: '말씀 먹고 자라나는 믿음의 새싹!', subtitle: '모든 성경은 하나님의 감동으로 된 것으로\n교훈과 책망과 바르게 함과 의로 교육하기에 유익하니\n이는 하나님의 사람으로 온전하게 하며\n모든 선한 일을 행할 능력을 갖추게 하려 함이라\n\n- 디모데후서 3장 16-17절', youtube: 'https://www.youtube.com/watch?v=kYgblEIX3aI' },
  { slug: 'elementary', image: '/uploads/image/6037241f1aa7f2076ceba82a.jpeg', title: '하나님을 경험하며 자라가는\nVINEYARD ELEMENTARY', subtitle: 'Do not conform any longer to the pattern of this world\nbut be transformed by the renewing of your mind.\n\n- Romans 12:2', youtube: 'https://www.youtube.com/watch?v=uPrYx-URm0Y' },
  { slug: 'youth', image: '/uploads/image/6037255c1aa7f2076ceba82c.jpeg', title: 'We Are the Church!', subtitle: '너희도 성령 안에서 하나님이 거하실 처소가 되기 위하여\n그리스도 예수 안에서 함께 지어져 가느니라\n\n- 에베소서 2장 22절', youtube: 'https://www.youtube.com/watch?v=DJeRPwRDdGs' },
  { slug: 'youngadult', image: '/uploads/image/603727241aa7f2076ceba832.jpeg', title: 'Life & Worship', subtitle: 'Anyone who receives instruction in the word must share\nall good things with his instructor\n\n- Galatians 6:17', youtube: 'https://www.youtube.com/watch?v=tpaACXlWVE8' },
  { slug: 'englishministry', image: '/uploads/image/603726d11aa7f2076ceba830.jpeg', title: '', subtitle: 'Therefore, I urge you, brothers and sisters, in view of God’s mercy, to offer your bodies as a living sacrifice, holy and pleasing to God.\n\n- Romans 12:1-2', youtube: 'https://www.youtube.com/watch?v=VDBM_bpxt6o' },
  { slug: 'enos', image: '/uploads/image/603727f11aa7f2076ceba834.jpeg', title: '기쁨과 감사가 넘치는 삶', subtitle: '여호와는 나의 목자시니\n내가 부족함이 없으리로다\n\n- 시편 23장 1절', youtube: null },
  { slug: 'gaonschool', image: '/uploads/image/62db0a42a04282b558ca9a40.png', title: '가온토요학교', subtitle: '세상의 중심에서 빛이 되는 미래의 리더를 교육합니다.\n\n“가온”은 순수 한글로 “가운데”라는 뜻을 가지고 있습니다.', youtube: null },
] as const

/** Adds and migrates legacy department banners, overlay copy, and intro videos. */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "hero_image_url" varchar;
    ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "hero_title" varchar;
    ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "hero_subtitle" varchar;
    ALTER TABLE "departments" ADD COLUMN IF NOT EXISTS "youtube_url" varchar;
  `)

  for (const item of departmentMedia) {
    await db.execute(sql`
      UPDATE "departments"
      SET
        "hero_image_url" = ${item.image},
        "hero_title" = ${item.title},
        "hero_subtitle" = ${item.subtitle},
        "youtube_url" = ${item.youtube},
        "updated_at" = now()
      WHERE "slug" = ${item.slug};
    `)
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "departments" DROP COLUMN IF EXISTS "youtube_url";
    ALTER TABLE "departments" DROP COLUMN IF EXISTS "hero_subtitle";
    ALTER TABLE "departments" DROP COLUMN IF EXISTS "hero_title";
    ALTER TABLE "departments" DROP COLUMN IF EXISTS "hero_image_url";
  `)
}
