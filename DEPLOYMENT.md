# Guía de Despliegue - Sistema de Agendamiento Médico

## 🚀 Despliegue en Vercel (Recomendado)

### Paso 1: Preparar el Repositorio

1. **Subir código a GitHub**:
\`\`\`bash
git add .
git commit -m "Initial commit"
git push origin main
\`\`\`

### Paso 2: Configurar Vercel

1. **Conectar repositorio**:
   - Ir a [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import desde GitHub
   - Seleccionar repositorio

2. **Configurar variables de entorno**:
\`\`\`env
# En Vercel Dashboard → Settings → Environment Variables

# Base de datos
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/medischedule

# JWT
JWT_SECRET=tu-jwt-secret-super-seguro-cambiar-en-produccion

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password

# WhatsApp
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_WHATSAPP_NUMBER=+14155238886

# Next.js
NEXTAUTH_URL=https://tu-app.vercel.app
NEXTAUTH_SECRET=tu-nextauth-secret
\`\`\`

3. **Deploy**:
   - Click "Deploy"
   - Esperar build completo
   - Verificar deployment

### Paso 3: Configurar Dominio (Opcional)

1. **Dominio personalizado**:
   - Vercel Dashboard → Settings → Domains
   - Agregar dominio
   - Configurar DNS

## 🗄️ Configuración de Base de Datos

### MongoDB Atlas (Recomendado)

1. **Crear cuenta**:
   - Ir a [mongodb.com/atlas](https://www.mongodb.com/atlas)
   - Registrarse gratis

2. **Crear cluster**:
   - Seleccionar plan gratuito (M0)
   - Elegir región cercana
   - Crear cluster

3. **Configurar acceso**:
   - Database Access → Add New User
   - Network Access → Add IP (0.0.0.0/0 para Vercel)

4. **Obtener connection string**:
   - Connect → Connect your application
   - Copiar URI
   - Reemplazar `<password>` con tu contraseña

### Alternativa: MongoDB Local

\`\`\`bash
# Instalar MongoDB
brew install mongodb/brew/mongodb-community

# Iniciar servicio
brew services start mongodb/brew/mongodb-community

# URI local
MONGODB_URI=mongodb://localhost:27017/medischedule
\`\`\`

## 📧 Configuración de Email

### Gmail (Recomendado)

1. **Habilitar 2FA**:
   - Google Account → Security
   - 2-Step Verification → Turn On

2. **Generar App Password**:
   - Security → App passwords
   - Select app: Mail
   - Generate password
   - Usar password generado en `SMTP_PASS`

### Alternativas

**SendGrid**:
\`\`\`env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=tu-sendgrid-api-key
\`\`\`

**Mailgun**:
\`\`\`env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=tu-mailgun-user
SMTP_PASS=tu-mailgun-password
\`\`\`

## 📱 Configuración de WhatsApp

### Twilio Setup

1. **Crear cuenta Twilio**:
   - Ir a [twilio.com](https://www.twilio.com)
   - Registrarse y verificar teléfono

2. **Configurar WhatsApp Sandbox**:
   - Console → Messaging → Try it out → Send a WhatsApp message
   - Seguir instrucciones para activar sandbox

3. **Obtener credenciales**:
   - Account SID y Auth Token desde Console
   - WhatsApp number del sandbox

### Producción WhatsApp

Para producción, necesitas:
- Aprobar WhatsApp Business API
- Configurar webhook
- Verificar número de negocio

## 🔧 Configuraciones Adicionales

### Headers de Seguridad

El archivo `next.config.js` incluye:
\`\`\`javascript
async headers() {
  return [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
      ],
    },
  ]
}
\`\`\`

### Optimizaciones de Performance

1. **Compresión habilitada**
2. **Bundle splitting configurado**
3. **Imágenes optimizadas**
4. **Caching headers**

## 🧪 Testing del Deployment

### Verificar Funcionalidades

1. **Login**:
   - Admin: `admin@medischedule.com` / `admin123`
   - Empresa: `admin@sanrafael.com` / `sanrafael123`

2. **Base de datos**:
   - Crear profesional
   - Verificar almacenamiento

3. **Email**:
   - Crear profesional
   - Verificar email de credenciales

4. **WhatsApp**:
   - Crear cita con teléfono
   - Verificar mensaje WhatsApp

### Monitoreo

1. **Vercel Analytics**:
   - Dashboard → Analytics
   - Monitorear performance

2. **Logs**:
   - Dashboard → Functions
   - Revisar logs de API

3. **Uptime**:
   - Configurar monitoring externo
   - UptimeRobot, Pingdom, etc.

## 🚨 Troubleshooting

### Build Errors

\`\`\`bash
# Error de TypeScript
npm run type-check

# Error de ESLint
npm run lint

# Build local
npm run build
\`\`\`

### Runtime Errors

1. **MongoDB Connection**:
   - Verificar URI
   - Verificar IP whitelist
   - Verificar credenciales

2. **Email Issues**:
   - Verificar SMTP settings
   - Verificar App Password
   - Revisar logs de Vercel

3. **WhatsApp Issues**:
   - Verificar Twilio credentials
   - Verificar sandbox status
   - Verificar formato de número

### Performance Issues

1. **Slow API responses**:
   - Optimizar queries MongoDB
   - Implementar caching
   - Revisar índices de DB

2. **Large bundle size**:
   - Analizar bundle con `@next/bundle-analyzer`
   - Implementar code splitting
   - Lazy loading de componentes

## 🔄 CI/CD Pipeline

### GitHub Actions (Opcional)

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy to Vercel

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
\`\`\`

## 📊 Métricas y Monitoring

### Vercel Analytics

- Core Web Vitals
- Page views
- Performance metrics

### Custom Monitoring

\`\`\`javascript
// lib/analytics.js
export function trackEvent(event, properties) {
  if (typeof window !== 'undefined') {
    // Google Analytics, Mixpanel, etc.
    gtag('event', event, properties)
  }
}
\`\`\`

---

**¡Deployment exitoso! 🎉**

Tu sistema de agendamiento médico está ahora en producción y listo para usar.
