import React, { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Send, ChevronDown, Search, CheckCircle, AlertCircle, X } from 'lucide-react'
import { useApp } from '../context/AppContext.jsx'
import { PanelHeader } from '../components/ui/UI.jsx'
import { C, S } from '../styles.js'
import { PT } from './shared/PageUtils.jsx'

// ════════════════════════════════════════════
//  CONSTANTS
// ════════════════════════════════════════════

const CATEGORIES = ['Tous', 'Projets', 'Tâches', 'Admin', 'Système', 'Dev']

const FAQS = [
  {
    q: 'Comment créer un projet ?',
    a: 'Allez dans Projets > "Nouveau projet". Remplissez le nom, la description, le statut et la couleur. Cliquez "Créer le projet".',
    category: 'Projets',
  },
  {
    q: 'Comment déplacer une tâche ?',
    a: "Dans la vue Kanban (Tâches), glissez-déposez la carte de tâche d'une colonne à l'autre. Le statut se met à jour automatiquement.",
    category: 'Tâches',
  },
  {
    q: 'Permissions du rôle client ?',
    a: 'Le client peut consulter le dashboard, les projets (lecture seule), la documentation et le chat. Il ne peut pas créer, modifier ou supprimer.',
    category: 'Admin',
  },
  {
    q: 'Comment lancer le pipeline ?',
    a: "Allez dans Pipeline CI/CD, cliquez \"Lancer Pipeline\". Les 4 étapes s'exécutent automatiquement : Checkout, Tests, Build, Deploy.",
    category: 'Dev',
  },
  {
    q: "L'application fonctionne-t-elle sans backend ?",
    a: "Oui ! En mode hors-ligne, les données sont chargées depuis le cache local. Une bannière jaune vous l'indique en haut de l'écran.",
    category: 'Système',
  },
  {
    q: "Comment changer le rôle d'un utilisateur ?",
    a: "Allez dans Utilisateurs (admin uniquement). Dans le tableau, utilisez le sélecteur de rôle sur la ligne de l'utilisateur. La modification est immédiate.",
    category: 'Admin',
  },
  {
    q: 'Comment réinitialiser les données mock ?',
    a: 'Si vous utilisez le backend Laravel : lancez "php artisan mock:reset" dans le terminal. En mode local : effacez le localStorage du navigateur.',
    category: 'Système',
  },
  {
    q: "Comment utiliser l'espace développeur ?",
    a: "L'espace développeur contient 8 outils : Terminal (commandes interactives), Éditeur (code avec coloration), Docker (gestion containers), Base de données (requêtes SQL), Debugger, Tests, Profiler et Config.",
    category: 'Dev',
  },
]

const RESOURCES = [
  { icon: '📚', title: 'Documentation',    desc: 'Guides complets et API Reference', color: '#00c8ff' },
  { icon: '🎬', title: 'Tutoriels vidéo',  desc: "Apprenez par l'exemple",           color: '#7c3aed' },
  { icon: '🎧', title: 'Support technique', desc: 'Réponse en moins de 24h',          color: '#00ff88' },
  { icon: '👥', title: 'Communauté',        desc: 'Forums et discussions dev',         color: '#ff6b35' },
]

// ════════════════════════════════════════════
//  CUSTOM HOOK — formulaire support
// ════════════════════════════════════════════

function useSupportForm(showToast) {
  const [fields, setFields] = useState({ sub: '', msg: '' })
  const [errors, setErrors]  = useState({})
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)

  const validate = useCallback(() => {
    const e = {}
    if (!fields.sub.trim()) e.sub = 'Le sujet est requis'
    if (!fields.msg.trim()) e.msg = 'Le message est requis'
    else if (fields.msg.trim().length < 10) e.msg = 'Message trop court (min. 10 caractères)'
    setErrors(e)
    return Object.keys(e).length === 0
  }, [fields])

  const handleChange = useCallback((key) => (e) => {
    setFields((prev) => ({ ...prev, [key]: e.target.value }))
    // Efface l'erreur du champ dès que l'utilisateur tape
    setErrors((prev) => ({ ...prev, [key]: undefined }))
  }, [])

  const handleSubmit = useCallback(async () => {
    if (!validate()) return
    setSending(true)
    try {
      await new Promise((r) => setTimeout(r, 800))
      showToast('Message envoyé au support !', 'success')
      setFields({ sub: '', msg: '' })
      setSent(true)
      setTimeout(() => setSent(false), 3000)
    } catch {
      showToast("Erreur d'envoi", 'danger')
    } finally {
      setSending(false)
    }
  }, [validate, showToast])

  return { fields, errors, sending, sent, handleChange, handleSubmit }
}

// ════════════════════════════════════════════
//  SUB-COMPONENTS
// ════════════════════════════════════════════

/** Carte ressource */
function ResourceCard({ icon, title, desc, color, onClick }) {
  return (
    <motion.div
      whileHover={{ y: -4, transition: { duration: 0.18 } }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      style={S.panel({ padding: 20, textAlign: 'center', cursor: 'pointer' })}
    >
      <div style={{ fontSize: 28, marginBottom: 10 }}>{icon}</div>
      <h3
        style={{
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 700,
          fontSize: 12,
          color: C.t1,
          marginBottom: 5,
        }}
      >
        {title}
      </h3>
      <p style={{ fontSize: 11, color: C.t3, lineHeight: 1.5, marginBottom: 13 }}>{desc}</p>
      <div
        style={{
          display: 'inline-block',
          padding: '5px 14px',
          borderRadius: 7,
          background: `${color}12`,
          color,
          border: `1px solid ${color}25`,
          fontSize: 10,
          fontFamily: 'Orbitron, sans-serif',
          fontWeight: 700,
        }}
      >
        Accéder →
      </div>
    </motion.div>
  )
}

/** Un item FAQ avec accordion */
function FAQItem({ faq, index, isOpen, onToggle }) {
  return (
    <div
      style={{
        borderRadius: 9,
        overflow: 'hidden',
        marginBottom: 7,
        border: `1px solid ${isOpen ? C.cyan + '40' : C.border}`,
        transition: 'border-color 0.2s',
      }}
    >
      <button
        onClick={() => onToggle(index)}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '12px 16px',
          background: isOpen ? `${C.cyan}08` : 'none',
          border: 'none',
          color: C.t1,
          cursor: 'pointer',
          textAlign: 'left',
          gap: 12,
          transition: 'background 0.2s',
        }}
      >
        <span
          style={{
            fontSize: 13,
            fontFamily: 'Rajdhani, sans-serif',
            fontWeight: 600,
            color: isOpen ? C.cyan : C.t1,
            flex: 1,
          }}
        >
          {faq.q}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <span
            style={{
              fontSize: 9,
              fontFamily: 'Orbitron, sans-serif',
              fontWeight: 700,
              padding: '2px 7px',
              borderRadius: 4,
              background: `${C.cyan}15`,
              color: C.cyan,
              letterSpacing: '0.05em',
            }}
          >
            {faq.category}
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
            style={{ color: C.cyan }}
          >
            <ChevronDown size={14} />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <div
              style={{
                padding: '12px 16px 14px',
                fontSize: 13,
                color: C.t2,
                lineHeight: 1.7,
                borderTop: `1px solid ${C.border}`,
              }}
            >
              {faq.a}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Champ de formulaire avec label + message d'erreur */
function FormField({ label, error, children }) {
  return (
    <div>
      <label style={S.label}>{label}</label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              marginTop: 5,
              fontSize: 11,
              color: '#ff4d4d',
            }}
          >
            <AlertCircle size={11} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ════════════════════════════════════════════
//  MAIN PAGE
// ════════════════════════════════════════════

export function HelpPage() {
  const { showToast } = useApp()
  const [openIndex, setOpenIndex]     = useState(null)
  const [search, setSearch]           = useState('')
  const [activeCategory, setCategory] = useState('Tous')

  const { fields, errors, sending, sent, handleChange, handleSubmit } = useSupportForm(showToast)

  const handleToggle = useCallback(
    (i) => setOpenIndex((prev) => (prev === i ? null : i)),
    []
  )

  // FAQ filtrée par recherche + catégorie
  const filteredFAQs = useMemo(() => {
    const q = search.toLowerCase()
    return FAQS.filter((f) => {
      const matchCat = activeCategory === 'Tous' || f.category === activeCategory
      const matchSearch = !q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)
      return matchCat && matchSearch
    })
  }, [search, activeCategory])

  // Réinitialise l'index ouvert si les résultats changent
  const handleSearch = useCallback((e) => {
    setSearch(e.target.value)
    setOpenIndex(null)
  }, [])

  const handleCategory = useCallback((cat) => {
    setCategory(cat)
    setOpenIndex(null)
  }, [])

  return (
    <div>
      {/* En-tête */}
      <div style={{ marginBottom: 24 }}>
        {PT('AIDE & SUPPORT')}
        <p style={{ color: C.t2, fontSize: 13, marginTop: 4 }}>
          Documentation, tutoriels et assistance technique
        </p>
      </div>

      {/* Ressources */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))',
          gap: 14,
          marginBottom: 24,
        }}
      >
        {RESOURCES.map((r) => (
          <ResourceCard
            key={r.title}
            {...r}
            onClick={() => showToast(`Ouverture : ${r.title}...`, 'info')}
          />
        ))}
      </div>

      {/* FAQ */}
      <div style={S.panel({ padding: 22, marginBottom: 20 })}>
        <PanelHeader icon={HelpCircle} title="Questions fréquentes (FAQ)" />

        {/* Barre de recherche */}
        <div
          style={{
            position: 'relative',
            marginBottom: 14,
            marginTop: 12,
          }}
        >
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 12,
              top: '50%',
              transform: 'translateY(-50%)',
              color: C.t3,
              pointerEvents: 'none',
            }}
          />
          <input
            value={search}
            onChange={handleSearch}
            placeholder="Rechercher une question..."
            style={{
              ...S.input,
              paddingLeft: 34,
              paddingRight: search ? 34 : undefined,
            }}
          />
          {search && (
            <button
              onClick={() => { setSearch(''); setOpenIndex(null) }}
              style={{
                position: 'absolute',
                right: 10,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: C.t3,
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Filtres par catégorie */}
        <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginBottom: 14 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategory(cat)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                border: `1px solid ${activeCategory === cat ? C.cyan : C.border}`,
                background: activeCategory === cat ? `${C.cyan}18` : 'none',
                color: activeCategory === cat ? C.cyan : C.t3,
                fontSize: 11,
                fontFamily: 'Orbitron, sans-serif',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s',
                letterSpacing: '0.04em',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Liste FAQ */}
        <AnimatePresence mode="wait">
          {filteredFAQs.length > 0 ? (
            <motion.div
              key={`${search}-${activeCategory}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {filteredFAQs.map((faq, i) => (
                <FAQItem
                  key={faq.q}
                  faq={faq}
                  index={i}
                  isOpen={openIndex === i}
                  onToggle={handleToggle}
                />
              ))}
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                padding: '32px 16px',
                color: C.t3,
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 8 }}>🔍</div>
              Aucun résultat pour <strong style={{ color: C.t2 }}>"{search}"</strong>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Contacter le support */}
      <div style={S.panel({ padding: 22 })}>
        <PanelHeader icon={HelpCircle} title="Contacter le support" color={C.neon} />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginTop: 12,
          }}
        >
          <FormField label="Sujet" error={errors.sub}>
            <input
              style={{
                ...S.input,
                borderColor: errors.sub ? '#ff4d4d' : undefined,
              }}
              value={fields.sub}
              onChange={handleChange('sub')}
              placeholder="Décrivez brièvement votre problème"
            />
          </FormField>

          <FormField label="Message" error={errors.msg}>
            <textarea
              style={{
                ...S.input,
                resize: 'none',
                height: 84,
                borderColor: errors.msg ? '#ff4d4d' : undefined,
              }}
              value={fields.msg}
              onChange={handleChange('msg')}
              placeholder="Détails de votre demande..."
            />
          </FormField>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button
            onClick={handleSubmit}
            disabled={sending}
            style={{
              ...S.btnNeon,
              fontSize: 12,
              opacity: sending ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {sending ? (
              <>
                <motion.span
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 0.6, ease: 'linear' }}
                  style={{
                    display: 'inline-block',
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    border: '2px solid currentColor',
                    borderTopColor: 'transparent',
                  }}
                />
                Envoi en cours...
              </>
            ) : (
              <>
                <Send size={12} />
                Envoyer le message
              </>
            )}
          </button>

          <AnimatePresence>
            {sent && (
              <motion.div
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  color: '#00ff88',
                }}
              >
                <CheckCircle size={13} />
                Message envoyé !
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
