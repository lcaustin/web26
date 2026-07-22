export const NEWS_CATEGORIES = [
  { value: '', ko: '전체', en: 'All' },
  { value: 'youth', ko: '중고등부', en: 'Youth' },
  { value: 'young-adults', ko: '대학청년부', en: 'College & Young Adults' },
  { value: 'elementary', ko: '초등부', en: 'Elementary' },
  { value: 'preschool', ko: '유아부', en: 'Preschool' },
  { value: 'nursery', ko: '영아부', en: 'Nursery' },
  { value: 'english-ministry', ko: 'English Ministry', en: '' },
] as const

export type NewsCategory = Exclude<(typeof NEWS_CATEGORIES)[number]['value'], ''>

export function isNewsCategory(value: string): value is NewsCategory {
  return NEWS_CATEGORIES.some((category) => category.value === value && value !== '')
}

export function newsCategoryLabel(value?: string | null) {
  const category = NEWS_CATEGORIES.find((item) => item.value === value && item.value !== '')
  if (!category) return ''
  return category.en ? `${category.ko} / ${category.en}` : category.ko
}

export function categoryForNewsText(value: string): NewsCategory | undefined {
  if (/(중고등부|청소년부|학생부|\byouth\b)/i.test(value)) return 'youth'
  if (/(대학\s*청년부|대학부|청년부|young\s*adults?)/i.test(value)) return 'young-adults'
  if (/(초등부|초등|\belementary\b)/i.test(value)) return 'elementary'
  if (/(유아부|유치부|\bpreschool\b|\bkindergarten\b)/i.test(value)) return 'preschool'
  if (/(영아부|영아|\bnursery\b)/i.test(value)) return 'nursery'
  if (/(english\s*ministry|\bEM\b)/i.test(value)) return 'english-ministry'
  return undefined
}
