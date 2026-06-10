import config from '@payload-config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

const missionKo = {
  root: {
    type: 'root',
    children: [
      {
        type: 'paragraph',
        children: [{ type: 'text', text: '주님의 교회는 어스틴 지역 복음화와 열방을 섬기는 일에 최선을 다하는 교회입니다. 예배를 통한 변화 그리고 열방을 섬김을 통하여서, 또 예수를 믿는 자들이 예배로 돌아오는 영적 서클을 계속 이어지게 하는 이 사명을 주님 오시는 그 날까지 감당하게 될 것입니다. 인생의 방황은 예수님을 만나면 끝이 납니다. 이민생활의 방황은 우리 주님의 교회, 좋은 교회를 만나면 끝이 나게 될 줄로 믿습니다. 우리 주님의 교회에서 새로운 신앙의 여정을 시작하시지 않겠습니까?', version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
        direction: 'ltr', format: '', indent: 0, textFormat: 0, textStyle: '', version: 1,
      },
      {
        type: 'heading',
        tag: 'h5',
        children: [{ type: 'text', text: '교단소개', version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
        direction: 'ltr', format: '', indent: 0, version: 1,
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'CRC는 Christian Reformed Church 의 약자로서 북미 주 개혁 장로교회를 나타내어 주는 이름입니다. CRC 교단은 200년 전 네덜란드의 칼빈주의자들이 더러는 박해를 피해서, 혹은 보다 나은 생활을 위해서 북미주로 이주한 이민 신앙인들로 시작되었습니다.', version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
        direction: 'ltr', format: '', indent: 0, textFormat: 0, textStyle: '', version: 1,
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'CRC 교단에는 미국과 캐나다의 약 1000여개의 교회들이 소속되어 있으며 예수 그리스도를 주와 구세주 (Lord and Savior) 로 고백합니다. 또한 16세기 종교개혁에 근거를 두고 있으며 역사적 개혁교회들과 함께 선한 행위로써는 구원 얻을 수 없음을 믿습니다.', version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
        direction: 'ltr', format: '', indent: 0, textFormat: 0, textStyle: '', version: 1,
      },
      {
        type: 'paragraph',
        children: [{ type: 'text', text: 'CRC가 스스로 개혁교회라 부르는 것은 개혁 교회들의 전통을 지키기 때문입니다. 이 개혁 교회들은 16세기의 교회 개혁자 칼빈(John Calvin)의 가르침을 따르며, 역시 칼빈의 신학에 근거를 둔 장로교와 같은 뿌리의 교단으로서 장로교 및 기타 개혁 교회들과 긴밀한 유대 관계를 가지고 있습니다. CRC에는 현재 150여개의 한인 교회들이 가입되어 있으며, 주님의 교회는 한미 노회에 소속되어 있습니다.', version: 1, detail: 0, format: 0, mode: 'normal', style: '' }],
        direction: 'ltr', format: '', indent: 0, textFormat: 0, textStyle: '', version: 1,
      },
    ],
    direction: 'ltr', format: '', indent: 0, version: 1,
  },
}

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Check if already exists
    const existing = await payload.find({
      collection: 'pages',
      where: { slug: { equals: 'introduction' } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ message: 'Already exists', id: existing.docs[0].id })
    }

    const page = await payload.create({
      collection: 'pages',
      data: {
        slug: 'introduction',
        title: { ko: '교회소개영상', en: 'Church Introduction' },
        icon: 'ti-church',
        subtitle: { ko: '교회소개', en: 'Church Introduction' },
        callout: {
          tagline: {
            ko: '예배의 감격으로 변화 받아 열방을 섬기는',
            en: 'Transformed by the Spirit of Worship to Serve the Nations',
          },
          message: {
            ko: '참 좋은 날입니다. 주님의 교회를 방문하신 분들을 진심으로 환영합니다.',
            en: 'Welcome to Lord\'s Church of Austin — where community and faith grow together.',
          },
        },
        heroImageUrl: 'https://static.lcaustin.org/uploads/image/697696034057671c8ba0d91d.jpeg',
        youtubeUrl: 'https://www.youtube.com/embed/6lzTX1ze7aQ',
        sections: [
          {
            blockType: 'richtext',
            text: { ko: missionKo, en: null },
          },
          // Photo grid will be added after running import-introduction-images
        ],
      },
    })

    return NextResponse.json({ message: 'Created', id: page.id })
  } catch (err: any) {
    console.error(err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
