# Email SaaS - Multi-tenant Email Marketing Platform

Una plataforma SaaS de marketing por email que permite a usuarios autenticados gestionar listas de clientes, crear plantillas de email con Handlebars, y enviar campañas de email masivas.

## 🚀 Quick Start

```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Crear archivo .env.local (copiar de .env.example)
cp .env.example .env.local

# Asegurar MongoDB corriendo
docker run -d -p 27017:27017 mongo

# (Opcional) Ejecutar Mailhog para ver emails
docker run -p 1025:1025 -p 8025:8025 mailhog/mailhog

# Iniciar servidor de desarrollo
npm run dev
```

Acceder a `http://localhost:3000`

## ✨ Features

- **Magic Link Authentication** - Autenticación sin contraseña con JWT
- **Multi-tenant** - Aislamiento completo de datos por tenant
- **Client Management** - CRUD de clientes con emails (Create, Read, Update, Delete)
- **Email Templates** - Editor de plantillas con Handlebars + preview en tiempo real
  - Variables dinámicas: `{{firstName}}`, `{{email}}`, campos custom
  - Preview split-view: editor ↔ preview en vivo
  - Validación JSON de test variables
- **Campaigns** - Crear y enviar campañas de email personalizadas
  - Wizard paso a paso
  - Selección de clientes (todos o específicos)
- **Dashboard** - Estadísticas y resumen de actividad

## 📂 Estructura

```
app/              - Next.js App Router
├── api/          - API endpoints
├── auth/         - Páginas de autenticación
└── dashboard/    - Panel de control autenticado
components/       - Componentes React reutilizables
lib/              - Utilidades (DB, Auth, etc.)
```

## 📚 Documentación

Ver [DOCUMENTACION.md](DOCUMENTACION.md) para:
- Instrucciones detalladas de setup
- Descripción de procesos
- Tests realizados
- Troubleshooting
- Comandos útiles

Ver [AGENTS.md](AGENTS.md) para:
- Arquitectura técnica completa
- Roadmap de features
- Referencias y notas de seguridad

## 📧 Cómo Crear una Plantilla de Email

1. **Dashboard** → **Templates** → **+ New Template**
2. Rellena los 4 campos:
   - **Template Name:** "Bienvenida"
   - **Email Subject:** "¡Hola {{firstName}}!"
   - **Template (Handlebars):** 
     ```
     Hola {{firstName}} {{lastName}},
     Tu email es {{email}}
     ```
   - **Test Variables (JSON):**
     ```json
     {"firstName": "Juan", "lastName": "Pérez", "email": "juan@example.com"}
     ```
3. **Preview** actualiza en tiempo real
4. Click **Save Template**

## 🛠️ Tech Stack

- **Frontend:** React 18, Next.js 14, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** MongoDB
- **Auth:** Magic Link + JWT
- **Email:** Mailhog (dev), SMTP-ready (prod)
- **Templates:** Handlebars

## 📋 API Endpoints

### Authentication
- `POST /api/auth/send-magic-link` - Enviar magic link token
- `POST /api/auth/verify` - Verificar token y obtener JWT

### Clients
- `GET /api/clients` - Listar clientes
- `POST /api/clients` - Crear cliente
- `PUT /api/clients/:id` - Actualizar cliente
- `DELETE /api/clients/:id` - Eliminar cliente

### Templates
- `GET /api/templates` - Listar templates
- `POST /api/templates` - Crear template
- `PUT /api/templates/:id` - Actualizar template
- `DELETE /api/templates/:id` - Eliminar template

### Campaigns
- `GET /api/campaigns` - Listar campañas
- `POST /api/campaigns` - Crear y enviar campaña

### Dashboard
- `GET /api/dashboard/stats` - Estadísticas del dashboard

## 🔒 Security Notes

- JWT almacenado en localStorage (cambiar a HttpOnly en prod)
- Magic link tokens expiran en 15 minutos
- Multitenancy enforced en todas las queries
- Validación de email format en clientes
- CORS y rate limiting (implementar en prod)

## 📝 License

MIT
