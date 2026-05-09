# Testing pendiente

## 👤 Admin (localhost:3000/admin/login)
`joaquin.castanos@gmail.com` / `Admin123!`

- [ ] Login correcto → admin dashboard
- [ ] Login pass incorrecta → error
- [ ] 5 intentos fallidos → bloqueado 15 min
- [ ] Dashboard muestra stats de la boda (10 invitados, venue, fecha)
- [ ] Toggle RSVP OFF → landing ya no muestra sección RSVP
- [ ] Toggle RSVP ON → vuelve a aparecer
- [ ] Toggle Regalos OFF → landing y panel novios ocultan regalos
- [ ] Toggle Regalos ON → vuelve
- [ ] Botón "Entrar como novios" → lleva a /couple/dashboard
- [ ] Desde /couple, botón "Admin" → vuelve al dashboard admin
- [ ] /admin/users → crear usuario COUPLE → eliminar
- [ ] Verificar que /api/admin/users como COUPLE da 401

---

## 💍 Novio/a (localhost:3000/couple/login)
`florencia@test.com` / `Novios123!`

- [ ] Login → dashboard con stats
- [ ] **Nuestra boda** → toggles RSVP y Regalos visibles → activar/desactivar → ver efecto en nav y landing
- [ ] Editar dress code → guardar → ver en landing
- [ ] **Invitados CRM**
  - [ ] Buscar "Valentina" → aparece
  - [ ] Filtrar "Confirmados" → vacío
  - [ ] Asignar mesa "1" a Valentina → Enter → se guarda
  - [ ] Botón "Link" → copia al portapapeles
  - [ ] Panel 🥗 dietas → vacío (nadie confirmó aún)
  - [ ] Agregar invitado nuevo → aparece en lista
- [ ] **Regalos** → agregar regalo con precio + link de pago → aparece en landing
- [ ] **Mi cuenta** → contraseña sin mayúscula → ver error de validación
- [ ] Intentar ir a /admin/dashboard como Florencia → redirige a /couple

---

## 🎟️ Invitados

**Valentina +1** → `localhost:3000/i/effbyixCGcyg34t2Hn6xP`
- [ ] Ve su nombre
- [ ] Declinar → cambiar a Confirmar
- [ ] Agregar acompañante con nombre + dieta
- [ ] Dejar mensaje para los novios
- [ ] Tab Regalos → click "Reservar" → tooltip "necesitás tu link"
- [ ] Volver al CRM: Valentina confirmada + acompañante + dieta en panel 🥗

**Diego +2** → `localhost:3000/i/uUixCCjjBj5SvnUazkaMS`
- [ ] Confirmar + 2 acompañantes
- [ ] Intentar agregar 3ero → no debe dejarlo
- [ ] Ver en CRM que "Total personas" subió

**Camila sin acompañantes** → `localhost:3000/i/QIWR60pLjFUoW7ePWT98x`
- [ ] Confirmar → sin opción acompañantes
- [ ] Reservar regalo (necesitás haber agregado uno como novio antes)
- [ ] Cancelar reserva → volver a reservar
- [ ] Ver en panel regalos de Florencia: quién reservó + "Marcar recibido"

**Tomás (solo RSVP, sin +1)** → `localhost:3000/i/tdsbuj6dcUYM1xAqGS8Bj`
- [ ] Con Regalos desactivado: solo ve tab RSVP, sin tabs
- [ ] Con RSVP desactivado y Regalos activo: solo ve regalos, sin tabs
- [ ] Con ambos desactivados: página carga pero sin contenido interactivo

---

## 🌐 Landing (localhost:3000)
- [ ] Fonts OK (Cormorant + Montserrat)
- [ ] Countdown andando
- [ ] Casona San Ignacio · 15:00 hs en detalles
- [ ] Sección RSVP: email de Camila → misma respuesta que email inventado
- [ ] Cards de regalos visibles → click "Reservar" → tooltip
- [ ] Footer "· acceso ·" → lleva a /couple/login

---

## 🔐 Seguridad
- [ ] Como Florencia (COUPLE): `GET /api/admin/users` → 401
- [ ] Como Florencia: `GET /api/admin/guests` → 401
- [ ] Abrir link de Valentina estando logueado como Florencia → no mezcla sesiones
- [ ] Olvidé contraseña: email real → "si está registrado te enviamos" → mismo mensaje con email falso
