# Sistema de Agendamiento Médico

Un sistema completo de gestión de citas médicas con múltiples roles de usuario, notificaciones automáticas y reportes avanzados.

## 🚀 Características

### Roles de Usuario
- **Administrador**: Gestión completa del sistema, empresas y profesionales
- **Empresa**: Gestión de profesionales y citas de su organización
- **Profesional**: Gestión de agenda personal y citas

### Funcionalidades Principales
- ✅ Autenticación JWT segura
- ✅ Gestión de citas médicas
- ✅ Carga masiva de profesionales
- ✅ Notificaciones por email y WhatsApp
- ✅ Reportes y estadísticas avanzadas
- ✅ Dashboard diferenciado por rol
- ✅ Interfaz responsive
- ✅ Base de datos MongoDB

## 🛠️ Tecnologías

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, MongoDB
- **UI**: shadcn/ui, Radix UI
- **Autenticación**: JWT
- **Notificaciones**: Nodemailer, Twilio
- **Despliegue**: Vercel

## 📦 Instalación

1. **Clonar el repositorio**
\`\`\`bash
git clone <repository-url>
cd medical-appointment-system
\`\`\`

2. **Instalar dependencias**
\`\`\`bash
npm install
\`\`\`

3. **Configurar variables de entorno**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edita `.env.local` con tus configuraciones:
- MongoDB URI
- JWT Secret
- Credenciales SMTP
- Credenciales Twilio

4. **Ejecutar en desarrollo**
\`\`\`bash
npm run dev
\`\`\`

## 🔧 Configuración

### Base de Datos MongoDB

1. **Local**:
\`\`\`bash
# Instalar MongoDB
brew install mongodb/brew/mongodb-community

# Iniciar servicio
brew services start mongodb/brew/mongodb-community

# URI: mongodb://localhost:27017/medischedule
\`\`\`

2. **MongoDB Atlas** (Recomendado para producción):
- Crear cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
- Crear cluster gratuito
- Obtener connection string
- Configurar en `MONGODB_URI`

### Email (Nodemailer)

1. **Gmail**:
\`\`\`env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-app-password
\`\`\`

2. **Generar App Password**:
- Ir a Google Account Settings
- Security → 2-Step Verification
- App passwords → Generate

### WhatsApp (Twilio)

1. **Crear cuenta Twilio**:
- Registrarse en [Twilio](https://www.twilio.com)
- Obtener Account SID y Auth Token
- Configurar WhatsApp Sandbox

2. **Configurar**:
\`\`\`env
TWILIO_ACCOUNT_SID=tu-account-sid
TWILIO_AUTH_TOKEN=tu-auth-token
TWILIO_WHATSAPP_NUMBER=+14155238886
\`\`\`

## 🚀 Despliegue en Vercel

1. **Conectar repositorio**:
- Ir a [Vercel](https://vercel.com)
- Import Git Repository
- Seleccionar el repositorio

2. **Configurar variables de entorno**:
- En Vercel Dashboard → Settings → Environment Variables
- Agregar todas las variables del `.env.example`

3. **Deploy**:
- Vercel desplegará automáticamente
- Cada push a main activará un nuevo deploy

## 📊 Uso del Sistema

### Credenciales por Defecto

**Administrador**:
- Email: `admin@medischedule.com`
- Password: `admin123`

**Empresa (Hospital San Rafael)**:
- Email: `admin@sanrafael.com`
- Password: `sanrafael123`

**Empresa (Clínica Norte)**:
- Email: `admin@clinicanorte.com`
- Password: `clinicanorte123`

**Profesional**:
- Email: `doctor1@sanrafael.com`
- Password: `doctor123`

### Flujo de Trabajo

1. **Admin**: Crear empresas y gestionar sistema
2. **Empresa**: Cargar profesionales masivamente y gestionar citas
3. **Profesional**: Gestionar agenda personal y atender pacientes

### Carga Masiva de Profesionales

1. **Descargar plantilla CSV**
2. **Completar datos**: Nombre, Especialidad, Email, Teléfono, Horas
3. **Subir archivo** usando el botón "Carga Masiva"
4. **Revisar resultados** y errores

### Gestión de Citas

1. **Crear cita**: Seleccionar profesional, fecha y hora
2. **Confirmación automática**: Email y WhatsApp al paciente
3. **Seguimiento**: Estados (Confirmada, Completada, Cancelada)
4. **Reportes**: Estadísticas y análisis

## 📈 Reportes Disponibles

- **Citas**: Total, por estado, por especialidad
- **Profesionales**: Rendimiento, calificaciones
- **Ingresos**: Por mes, por especialidad
- **Performance**: Tasas de completación y cancelación

## 🔒 Seguridad

- Autenticación JWT con expiración
- Validación de datos en frontend y backend
- Sanitización de inputs
- Protección de rutas por rol
- Headers de seguridad configurados

## 🐛 Solución de Problemas

### Error de Conexión MongoDB
\`\`\`bash
# Verificar que MongoDB esté ejecutándose
brew services list | grep mongodb

# Reiniciar servicio
brew services restart mongodb/brew/mongodb-community
\`\`\`

### Error de Email
\`\`\`bash
# Verificar credenciales SMTP
# Generar nuevo App Password en Gmail
# Verificar configuración 2FA
\`\`\`

### Error de WhatsApp
\`\`\`bash
# Verificar Twilio Sandbox
# Confirmar número de WhatsApp en Twilio Console
# Revisar formato de número (+57...)
\`\`\`

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 📞 Soporte

Para soporte técnico:
- Email: soporte@medischedule.com
- WhatsApp: +57 300 123 4567
- Documentación: [docs.medischedule.com](https://docs.medischedule.com)

---

**Desarrollado con ❤️ para mejorar la gestión médica**
