# Email SaaS - Micropromppt Ejecutivo

## VISIÓN GENERAL
Desarrollar un SaaS multitenant que permita a usuarios autenticados gestionar listas de clientes, crear plantillas de email con Handlebars, renderizar para previsualizar, y enviar campañas de email masivas mediante mailhog en local.

---

## ARQUITECTURA TÉCNICA

**Stack:**
- Frontend: Next.js 16 + React (responsivo, diseño profesional gris/negro)
- Backend: Next.js API routes + MongoDB nativo (driver native)
- Autenticación: Magic Link + JWT (localStorage)
- Email: Mailhog (desarrollo local) con Handlebars para plantillas
- Diseño: Frontend-design para landing page y componentes

**Base de datos MongoDB:**
- Colecciones:
  - `users` (Id, email, tenantId, accessCount, createdAt, lastLoginAt)
  - `tenants` (Id, name, ownerId, createdAt) - para multitenancy
  - `clients` (Id, tenantId, name, email, metadata{}, createdAt, updatedAt)
  - `emailTemplates` (Id, tenantId, name, subject, handlebarsTemplate, variables[], createdAt, updatedAt)
  - `emailCampaigns` (Id, tenantId, name, templateId, clientList[], status, sentAt, results[])

---

## FUNCIONALIDAD POR MÓDULO

### 1. AUTENTICACIÓN
**MAGIC LINK LOGIN**
- Campo input para ingresar email con validación de formato
- Si email NO existe → registrarlo automáticamente
- Si email EXISTE → mostrar popup de bienvenida
- Generar token JWT tras validación
- Guardar JWT en localStorage
- Resetear input y actualizar estado global

**JWT MANAGEMENT**
- Verificar JWT al iniciar app
- Redirect a login si inválido/expirado
- Logout limpia localStorage

---

### 2. GESTIÓN DE CLIENTES
**CRUD CLIENTES**
- Crear: form con nombre, email, metadata opcional
- Listar: tabla con scroll, filtro por busca, paginación
- Actualizar: edit inline o modal
- Eliminar: confirmación antes de borrar
- Importar CSV: bulk upload de clientes
- Validación: email único por tenant

---

### 3. PLANTILLAS DE EMAIL
**CRUD TEMPLATES**
- Crear: editor con subject + body (Handlebars syntax)
- Variables disponibles: {{firstName}}, {{lastName}}, {{email}}, {{customField}}
- Listar: tabla de plantillas activas
- Actualizar: editar subject y body
- Duplicar: clone template rápido
- Eliminar: soft delete (marcar como inactiva)

**RENDERIZADOR & PREVIEW**
- Panel split: izq=editor Handlebars, der=preview en tiempo real
- Input para probar variables (objeto JSON)
- Vista móvil/desktop del preview
- Validar sintaxis Handlebars y advertir errores

---

### 4. CAMPAÑAS DE EMAIL
**CREAR CAMPAÑA**
- Seleccionar template
- Seleccionar clientes (individual, por filtro, todos)
- Revisar preview con primeros N registros
- Schedule envío (inmediato o fechado)
- Confirmar antes de enviar

**SEGUIMIENTO**
- Estado de campaña: draft → enviando → completada/fallida
- Log de envíos: email, timestamp, status (entregado/bounce/error)
- Estadísticas: total enviados, tasa de éxito, errores
- Reintento de fallos

---

### 5. MULTITENANCY
- Aislar datos por tenantId en todas las consultas
- Cada usuario pertenece a un tenant (ownerId o invitado)
- Invitar usuarios a tenant (magic link + tenantId)
- Dashboard del tenant con miembros y permisos

---

## FRONTEND - INTERFAZ

**LANDING PAGE (frontend-design):**
- Hero section con CTA "Empezar gratis"
- Features destacadas: emails personalizados, segmentación, multitenancy
- Pricing simple (free tier + pro)
- Responsive, diseño profesional gris/negro

**DASHBOARD (post-login):**
- Navbar: logo, email actual, switch tenant, logout
- Sidebar: navegación principal (Clientes, Templates, Campañas, Settings)
- Estilos: tonos grises, negros, blancos. Inputs y botones con hover states

**SECCIONES PRINCIPALES:**
```
┌─ Clientes
│  ├─ Tabla listado con acciones (editar, eliminar, importar CSV)
│  └─ Modal crear/editar cliente
│
├─ Templates
│  ├─ Listado templates
│  ├─ Editor Handlebars con preview split
│  └─ Renderizador para testing
│
├─ Campañas
│  ├─ Listado con estado
│  ├─ Wizard crear campaña (template → clientes → review → confirmar)
│  └─ Detalle de campaña con logs y estadísticas
│
└─ Settings
   ├─ Perfil usuario
   ├─ Gestión del tenant
   └─ Miembros del equipo
```

---

## FLUJO DE DESARROLLO

### Phase 1: Autenticación & Base
- [ ] Setup Next.js + MongoDB conexión
- [ ] Magic link + JWT
- [ ] Tabla usuarios y tenants

### Phase 2: CRUD Clientes
- [ ] API endpoints (GET, POST, PUT, DELETE)
- [ ] UI tabla clientes + formularios
- [ ] Importar CSV

### Phase 3: Plantillas
- [ ] API plantillas CRUD
- [ ] Editor Handlebars
- [ ] Renderizador con variables de test

### Phase 4: Campañas & Mailhog
- [ ] API campañas CRUD
- [ ] Integración Mailhog
- [ ] Wizard crear campaña
- [ ] Logs y estadísticas

### Phase 5: Multitenancy
- [ ] Aislar datos por tenant
- [ ] Invitar usuarios
- [ ] Dashboard tenant

### Phase 6: Frontend Polish
- [ ] Landing page con frontend-design
- [ ] Responsive completo
- [ ] Temas y dark mode
- [ ] Documentación

---

## TESTING LOCAL

**Setup Mailhog:**
```bash
# Docker
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Vista: http://localhost:8025
```

**Test Data:**
- 5 usuarios de prueba: 4 nuevos + 1 existente
- 3 templates de ejemplo (bienvenida, newsletter, reseteo password)
- 10 clientes para campaign test
- Validar renderizado de variables en cada template

---

## DOCUMENTACIÓN REQUERIDA

**DOCUMENTACION.md:**
- Instrucciones setup y ejecución
- Descripción secuencial de procesos (autenticación → crear cliente → crear template → enviar campaña)
- Screenshots de cada sección
- Tests realizados y cobertura
- Errores encontrados y soluciones
- Tech stack detallado (librerías, versiones)
- Comandos útiles

---

## REFERENCIAS

- Handlebars syntax: https://handlebarsjs.com/
- Next.js + MongoDB: https://mongodb.com/docs/drivers/node/
- Mailhog Docker: https://github.com/mailhog/MailHog
- JWT + localStorage: Standard practices (secure HttpOnly cookies para prod)

---

## NOTAS IMPORTANTES

1. **Seguridad:** JWT en localStorage OK para desarrollo; en producción usar HttpOnly cookies
2. **Validación:** Validar email format, Handlebars syntax, metadata JSON
3. **UX:** Spinner durante envío de campaña, notificaciones de éxito/error
4. **Performance:** Paginar clientes (100 por página), cache de templates
5. **Escalabilidad:** Preparar para agregar trabajos async (colas) cuando campañas sean grandes
