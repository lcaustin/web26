type Props = {
  messageKo?: string | null
  messageEn?: string | null
  registerLabelKo?: string | null
  registerLabelEn?: string | null
  registerHref?: string | null
}

const DEFAULTS = {
  messageKo: '어스틴 주님의교회에 오신 것을 환영합니다!',
  messageEn: 'Welcome to Lord’s Church of Austin — where community and faith grow together',
  registerLabelKo: '새가족 등록 안내',
  registerLabelEn: 'New Family Registration',
  registerHref: '/register',
}

export default function WelcomeBanner({
  messageKo,
  messageEn,
  registerLabelKo,
  registerLabelEn,
  registerHref,
}: Props) {
  return (
    <div className="welcome">
      <div className="wrap welcome-inner">
        <div className="welcome-ko">{messageKo || DEFAULTS.messageKo}</div>
        <div className="welcome-divider" />
        <div className="welcome-en">{messageEn || DEFAULTS.messageEn}</div>
        <a href={registerHref || DEFAULTS.registerHref} className="welcome-link">
          <i className="ti ti-user-plus" aria-hidden="true" />
          {registerLabelKo || DEFAULTS.registerLabelKo} ·{' '}
          {registerLabelEn || DEFAULTS.registerLabelEn}
        </a>
      </div>
    </div>
  )
}
