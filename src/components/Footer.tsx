type Props = {
  nameKo?: string | null
  nameEn?: string | null
  addressKo?: string | null
  phone?: string | null
  email?: string | null
}

const DEFAULTS = {
  nameKo: '어스틴 주님의교회',
  nameEn: "Lord's Church of Austin",
  addressKo: '11900 Ranch Rd 620 N, Cedar Park, TX 78613',
  phone: '(512) 465-9191',
  email: 'webmaster@lcaustin.org',
}

export default function Footer({ nameKo, nameEn, addressKo, phone, email }: Props) {
  const address = addressKo || DEFAULTS.addressKo
  const mapsHref = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

  return (
    <footer>
      <div className="wrap">
        <div className="footer-inner">
          <div className="footer-brand">
            <div className="fko">{nameKo || DEFAULTS.nameKo}</div>
            <div className="fen">{nameEn || DEFAULTS.nameEn}</div>
          </div>
          <div className="footer-info">
            <div>
              <a href={mapsHref} target="_blank" rel="noopener noreferrer">
                <i
                  className="ti ti-map-pin"
                  aria-hidden="true"
                  style={{ fontSize: 13, verticalAlign: -2, marginRight: 4 }}
                />
                {address}
              </a>
            </div>
            <div>
              ✉ {email || DEFAULTS.email} · 📞 {phone || DEFAULTS.phone}
            </div>
          </div>
        </div>
        <div className="footer-copy">
          © {new Date().getFullYear()} Lord&apos;s Church of Austin · 어스틴 주님의교회. All rights
          reserved.
        </div>
      </div>
    </footer>
  )
}
