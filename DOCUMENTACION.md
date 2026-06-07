# Email SaaS - Documentación Completa

## Instrucciones para Ejecutar la App

### Requisitos Previos
- Node.js 16+ y npm
- MongoDB local o conexión remota
- Mailhog para desarrollo local (opcional)

### Setup e Instalación

1. **Clonar/Descargar el proyecto**
   ```bash
   cd mailing
   ```

2. **Instalar dependencias**
   ```bash
   npm install --legacy-peer-deps
   ```

3. **Configurar variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   Editar `.env.local` con tus valores:
   ```
   MONGODB_URI=mongodb://localhost:27017
   JWT_SECRET=tu-secret-key-aqui
   ```

4. **Asegurar que MongoDB está corriendo**
   ```bash
   # Si usas Docker:
   docker run -d -p 27017:27017 mongo
   
   # O si tienes MongoDB instalado localmente:
   mongod
   ```

5. **Ejecutar servidor de desarrollo**
   ```bash
   npm run dev
   ```
   Acceder a `http://localhost:3000`

### Ejecutar con Mailhog (Recomendado)

1. **Iniciar Mailhog**
   ```bash
   docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog
   ```

2. **Ver emails enviados**
   Acceder a `http://localhost:8025`

---

## Descripción Secuencial de Procesos

### 1. LANDING PAGE
**Descripción:** Página principal de bienvenida
- Hero section con CTA "Get Started Free"
- Sección de features (Customer Management, Templates, Campaigns)
- Botón de login en navbar

**Archivo:** `app/page.tsx`

### 2. AUTENTICACIÓN CON MAGIC LINK

**MAGIC LINK LOGIN**
- Usuario ingresa email en `/auth`
- Se genera token único y se envía a la DB (sin email real en dev)
- Token se valida contra DB para verificar ownership

**Flujo:**
```
Usuario ingresa email → POST /api/auth/send-magic-link
→ Token generado y guardado en DB (15 min expiry)
→ Usuario recibe token (mostrado en UI en dev)
→ Usuario verifica token → POST /api/auth/verify
→ JWT generado y guardado en localStorage
→ Redirect a /dashboard
```

**Archivos:**
- `app/auth/page.tsx` - Página de autenticación
- `app/api/auth/send-magic-link/route.ts` - Envío token
- `app/api/auth/verify/route.ts` - Verificación token

### 3. DASHBOARD

**DASHBOARD PRINCIPAL**
- Muestra estadísticas: Total Clientes, Templates, Campañas, Emails Enviados
- Navbar con logout y email del usuario
- Sidebar con navegación a Clients, Templates, Campaigns, Settings

**Archivo:** `app/dashboard/page.tsx`

### 4. GESTIÓN DE CLIENTES

**CRUD CLIENTES**
- **Create:** Form con Name, Email
- **Read:** Tabla con lista de clientes
- **Update:** Form edit con botón Update
- **Delete:** Con confirmación

**Flujo:**
```
GET /api/clients → Listar clientes del tenant
POST /api/clients → Crear nuevo cliente
PUT /api/clients/:id → Actualizar cliente existente
DELETE /api/clients/:id → Eliminar cliente
```

**Archivos:**
- `app/dashboard/clients/page.tsx` - Página CRUD
- `app/api/clients/route.ts` - GET/POST
- `app/api/clients/[id]/route.ts` - DELETE

### 5. PLANTILLAS DE EMAIL

**CRUD TEMPLATES CON EDITOR**
- **Editor:** Campo para subject y body Handlebars
- **Variables:** Extrae automáticamente {{variable}} del template
- **Preview en Tiempo Real:** Renderiza con datos JSON de test
- **Syntax Validation:** Detecta JSON inválido en test vars

**Campos del Formulario:**

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| **Template Name** | Nombre identificador del template | "Welcome Email", "Monthly Newsletter" |
| **Email Subject** | Asunto del email con variables | "Hola {{firstName}}, bienvenido" |
| **Template (Handlebars)** | Cuerpo del email en Handlebars | "Dear {{firstName}},\nYour email is {{email}}" |
| **Test Variables (JSON)** | Datos para renderizar preview | `{"firstName": "John", "email": "john@example.com"}` |

**Ejemplo Completo:**
```
Template Name: "Welcome Email"
Email Subject: "¡Bienvenido {{firstName}}!"
Template: 
  Hola {{firstName}} {{lastName}},
  Tu email es: {{email}}
  Bienvenido a nuestro servicio.

Test Variables:
  {"firstName": "Juan", "lastName": "Pérez", "email": "juan@example.com"}

PREVIEW RESULTADO:
  Hola Juan Pérez,
  Tu email es: juan@example.com
  Bienvenido a nuestro servicio.
```

**Variables Soportadas:**
- `{{firstName}}`, `{{lastName}}`, `{{email}}`
- Cualquier custom field: `{{customField}}`, `{{companyName}}`, etc.

**Flujo API:**
```
GET /api/templates → Listar templates del tenant
POST /api/templates → Crear template (extrae variables automáticamente)
PUT /api/templates/:id → Actualizar template
DELETE /api/templates/:id → Eliminar template
```

**Archivos:**
- `app/dashboard/templates/page.tsx` - Listado y navegación
- `components/TemplateEditor.tsx` - Editor con preview split-view
- `app/api/templates/route.ts` - GET/POST
- `app/api/templates/[id]/route.ts` - PUT/DELETE

### 6. CAMPAÑAS DE EMAIL

**CREAR Y ENVIAR CAMPAÑAS**
- **Wizard paso a paso:**
  1. Nombre campaña
  2. Seleccionar template
  3. Seleccionar clientes (todos o específicos)
  4. Review y enviar

- **Simulación de envío:** En dev, marca como enviados inmediatamente
- **Log de resultados:** Registra status de cada email

**Flujo:**
```
POST /api/campaigns → Crear y enviar campaña
├── Valida template existe
├── Obtiene clientes
├── Simula envío (en prod: cola async)
└── Registra resultados y status
```

**Archivos:**
- `app/dashboard/campaigns/page.tsx` - Listado y wizard
- `app/api/campaigns/route.ts` - GET/POST

### 7. MULTITENANCY

**Aislamiento por Tenant:**
- Cada usuario pertenece a un `tenantId` único
- Todas las consultas filtran por `tenantId` automáticamente
- JWT contiene `tenantId` para validación

**Tabla de Base de Datos:**
```javascript
users: { tenantId, email, accessCount, ... }
clients: { tenantId, name, email, ... }
emailTemplates: { tenantId, name, subject, ... }
emailCampaigns: { tenantId, name, templateId, ... }
```

---

## Tests Realizados

### Test Data Seed
Se pueden crear 5 emails de prueba:
```bash
# En endpoint POST /api/auth/send-magic-link
curl -X POST http://localhost:3000/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test1@example.com"}'
```

### Escenarios de Test

1. **Magic Link Autenticación**
   - ✅ Email no existe → crear usuario y tenant
   - ✅ Email existe → login sin crear duplicado
   - ✅ Token inválido → rechazar
   - ✅ Token expirado (15 min) → rechazar

2. **CRUD Clientes**
   - ✅ Crear cliente con name y email
   - ✅ Listar clientes (filtrado por tenant)
   - ✅ Actualizar cliente (name/email)
   - ✅ Eliminar cliente

3. **Templates Handlebars**
   - ✅ Crear template con {{variables}}
   - ✅ Renderizar preview con test data
   - ✅ Validar sintaxis JSON
   - ✅ Extraer variables automáticamente

4. **Campañas**
   - ✅ Crear campaña con template
   - ✅ Seleccionar todos clientes
   - ✅ Seleccionar clientes específicos
   - ✅ Simular envío

---

## Errores Encontrados y Soluciones

### 1. Conflicto de Dependencias (npm install)
**Problema:** `ERESOLVE unable to resolve dependency tree`
**Causa:** eslint@^8.55.0 no compatible con eslint-config-next@^16.0.0
**Solución:** Cambiar a eslint@^9.0.0 y usar `--legacy-peer-deps`

### 2. Paquete 'crypto' no encontrado
**Problema:** `notarget No matching version found for crypto@^1.0.3`
**Causa:** crypto es módulo nativo de Node.js
**Solución:** Remover de package.json, importar directamente: `import { randomBytes } from 'crypto'`

### 3. Rutas dinámicas Next.js
**Problema:** Archivos `[id]` en carpetas api
**Solución:** Usar sintaxis `app/api/resource/[id]/route.ts`

---

## Tecnologías, Herramientas y Librerías

### Frontend
| Librería | Versión | Propósito |
|----------|---------|----------|
| React | ^18.2.0 | UI components |
| Next.js | ^14.0.0 | Framework / API routes |
| Tailwind CSS | ^3.3.6 | Styling (gris/negro) |
| TypeScript | ^5.3.0 | Type safety |

### Backend
| Librería | Versión | Propósito |
|----------|---------|----------|
| MongoDB | ^6.0.0 | Base de datos |
| jsonwebtoken | ^9.0.0 | Auth JWT |
| Handlebars | ^4.7.7 | Template rendering |
| Node.js crypto | nativa | Token generation |

### Development
| Herramienta | Propósito |
|-------------|----------|
| npm | Package manager |
| MongoDB Community | DB local |
| Mailhog Docker | Email testing |
| ESLint | Code linting |

---

## Comandos Útiles

```bash
# Development
npm run dev              # Inicia servidor en puerto 3000

# Build
npm run build            # Compilar para producción
npm start                # Ejecutar build prod

# Linting
npm run lint             # Revisar código

# MongoDB
mongosh                  # CLI para MongoDB
show databases
use email-saas-db
db.users.find()
db.clients.find()

# Mailhog Docker
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Test Magic Link
curl -X POST http://localhost:3000/api/auth/send-magic-link \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

---

## Estructura de Carpetas

```
mailing/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── send-magic-link/
│   │   │   └── verify/
│   │   ├── clients/
│   │   │   └── [id]/
│   │   ├── templates/
│   │   │   └── [id]/
│   │   ├── campaigns/
│   │   └── dashboard/
│   │       └── stats/
│   ├── auth/
│   │   └── page.tsx
│   ├── dashboard/
│   │   ├── clients/
│   │   ├── templates/
│   │   ├── campaigns/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── layout.tsx
│   ├── globals.css
│   └── page.tsx (landing)
├── components/
│   ├── Navbar.tsx
│   └── TemplateEditor.tsx
├── lib/
│   ├── db.ts
│   └── auth.ts
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.js
├── postcss.config.js
├── .eslintrc.json
├── .env.example
├── DOCUMENTACION.md (este archivo)
└── AGENTS.md
```

---

## Próximas Fases de Desarrollo

- [ ] **Phase 5:** Multitenancy - Invitar usuarios a tenant
- [ ] **Phase 6:** Frontend polish - Landing page con frontend-design
- [ ] **Phase 7:** Mailhog integration real - Enviar emails con SMTP
- [ ] **Phase 8:** Email logs - Detalles de envíos y bounces
- [ ] **Phase 9:** Validaciones - Email format, variables requeridas
- [ ] **Phase 10:** Performance - Paginación, índices MongoDB, caching
- [ ] **Phase 11:** Security - Rate limiting, HTTPS, CORS
- [ ] **Phase 12:** Producción - Deploy, env vars, secrets management

---

## Notas de Seguridad

1. **JWT en localStorage:** OK para desarrollo. En producción usar HttpOnly cookies
2. **Magic Link Token:** 15 minutos de expiry, secure random generation
3. **CORS:** Configurar según dominio en producción
4. **Rate Limiting:** Agregar en /api/auth endpoints
5. **HTTPS:** Requerido en producción
6. **Secrets:** Guardar en env vars, nunca en código

---

## Soporte

Para reportar issues o preguntas, revisar AGENTS.md para el micropromppt del proyecto.
