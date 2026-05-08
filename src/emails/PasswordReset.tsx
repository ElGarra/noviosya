import * as React from 'react'

interface PasswordResetProps {
  name: string | null
  resetUrl: string
  expiresInMinutes: number
}

export function PasswordReset({ name, resetUrl, expiresInMinutes }: PasswordResetProps) {
  return (
    <html>
      <head><meta charSet="utf-8" /></head>
      <body style={{ fontFamily: 'Georgia, serif', background: '#F5F0E8', margin: 0, padding: '40px 20px' }}>
        <div style={{ maxWidth: 520, margin: '0 auto', background: '#fff', padding: '48px 40px', borderTop: '3px solid #C9A84C' }}>
          <p style={{ color: '#C9A84C', fontSize: 11, letterSpacing: '0.3em', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif', margin: '0 0 32px' }}>
            Seguridad de cuenta
          </p>

          <h1 style={{ fontFamily: 'Georgia, serif', fontWeight: 300, fontSize: 28, color: '#2C2C2C', margin: '0 0 24px' }}>
            Restablecer contraseña
          </h1>

          <p style={{ color: '#7a7065', fontSize: 15, lineHeight: 1.8, fontFamily: 'Arial, sans-serif', margin: '0 0 24px' }}>
            Hola{name ? ` ${name}` : ''},
          </p>

          <p style={{ color: '#7a7065', fontSize: 15, lineHeight: 1.8, fontFamily: 'Arial, sans-serif', margin: '0 0 32px' }}>
            Recibimos una solicitud para restablecer tu contraseña. Hacé click en el botón de abajo.
            Este link expira en <strong>{expiresInMinutes} minutos</strong>.
          </p>

          <a href={resetUrl} style={{
            display: 'inline-block', background: '#C9A84C', color: '#fff',
            textDecoration: 'none', padding: '14px 32px', fontSize: 13,
            letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: 'Arial, sans-serif',
          }}>
            Restablecer contraseña
          </a>

          <p style={{ color: '#7a7065', fontSize: 12, marginTop: 32, fontFamily: 'Arial, sans-serif' }}>
            Si no solicitaste esto, ignorá este email. Tu contraseña no cambiará.
          </p>

          <div style={{ borderTop: '1px solid #F5F0E8', marginTop: 32, paddingTop: 24 }}>
            <p style={{ color: '#aaa', fontSize: 11, fontFamily: 'Arial, sans-serif', margin: 0 }}>
              {resetUrl}
            </p>
          </div>
        </div>
      </body>
    </html>
  )
}
