import {api} from './api.js'

// ════════════════════════════════════════════════════════
//  devspaceApi.js
//  Fonction miavaka ho an'ny endpoint DevSpace TENA MARINA
//  (tsy ny fake/mock taloha). Mampiasa ny request() helper
//  efa ao amin'i api.js mba tsy hamerina kaody (token, erreur, sns).
// ════════════════════════════════════════════════════════

export const devspaceApi = {

  // ── Docker (réel) ────────────────────────────────────
  dockerContainers: ()           => api.get('/devspace/docker/containers'),
  dockerStats:      ()           => api.get('/devspace/docker/stats'),
  dockerStart:      (id)         => api.post(`/devspace/docker/containers/${id}/start`),
  dockerStop:       (id)         => api.post(`/devspace/docker/containers/${id}/stop`),
  dockerRestart:    (id)         => api.post(`/devspace/docker/containers/${id}/restart`),
  dockerLogs:       (id,tail=100)=> api.get(`/devspace/docker/containers/${id}/logs?tail=${tail}`),

  // ── DB Query tool (réel, lecture seule) ───────────────
  dbTables:   ()      => api.get('/devspace/db/tables'),
  dbColumns:  (table) => api.get(`/devspace/db/tables/${table}/columns`),
  dbQuery:    (sql)   => api.post('/devspace/db/query', { sql }),

  // ── Terminal (réel, whitelist de commandes) ───────────
  terminalAllowed: ()        => api.get('/devspace/terminal/allowed'),
  terminalExec:    (command) => api.post('/devspace/terminal/exec', { command }),

  // ── Tests (réel, exécute vendor/bin/phpunit côté serveur) ──
  testsList: ()       => api.get('/devspace/tests'),
  testsRun:  (cls=null) => api.post('/devspace/tests/run', { class: cls }),
}