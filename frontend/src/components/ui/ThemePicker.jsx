import React from 'react'
import { useTheme } from '../../context/ThemeContext.jsx'
import { C, S } from '../../styles.js'

// ── ThemePicker : afaka asiana ao SettingsPage na Navbar ──
export default function ThemePicker() {
  const { themeId, changeTheme, themes } = useTheme()

  return (
    <div>
      <p style={{ ...S.label, marginBottom: 14 }}>Thème de l'application</p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {Object.values(themes).map(theme => {
          const active = themeId === theme.id
          return (
            <button
              key={theme.id}
              onClick={() => changeTheme(theme.id)}
              style={{
                background: active ? C.accentBg : C.surface,
                border: `1.5px solid ${active ? C.accent : C.border}`,
                borderRadius: 10,
                padding: '14px 16px',
                cursor: 'pointer',
                transition: 'all 0.18s',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              {/* Pastilles couleurs preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}>
                {theme.preview.map((col, i) => (
                  <div
                    key={i}
                    style={{ width: 8, height: 8, borderRadius: '50%', background: col }}
                  />
                ))}
              </div>

              {/* Label */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontSize: 12, fontWeight: 600, color: active ? C.accent : C.t1,
                  marginBottom: 2, whiteSpace: 'nowrap',
                }}>
                  {theme.label}
                </p>
                <p style={{ fontSize: 10, color: C.t3 }}>{theme.desc}</p>
              </div>

              {/* Indicateur actif */}
              <div style={{
                width: 16, height: 16, borderRadius: '50%',
                border: `1.5px solid ${active ? C.accent : C.border}`,
                background: active ? C.accent : 'transparent',
                flexShrink: 0, transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {active && (
                  <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.bg }} />
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
