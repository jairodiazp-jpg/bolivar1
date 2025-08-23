# Despliegue en Vercel - MediSchedule

## Pasos para desplegar

### 1. Preparar el repositorio
\`\`\`bash
git init
git add .
git commit -m "Initial commit - MediSchedule system"
\`\`\`

### 2. Crear repositorio en GitHub
1. Ve a GitHub y crea un nuevo repositorio
2. Conecta tu proyecto local:
\`\`\`bash
git remote add origin https://github.com/tu-usuario/medischedule.git
git branch -M main
git push -u origin main
\`\`\`

### 3. Desplegar en Vercel
1. Ve a [vercel.com](https://vercel.com) e inicia sesión
2. Haz clic en "New Project"
3. Importa tu repositorio de GitHub
4. Configura las variables de entorno en el dashboard de Vercel:

#### Variables de Entorno Requeridas:
\`\`\`
JWT_SECRET=tu-clave-secreta-jwt-aqui-cambia-en-produccion
NEXTAUTH_URL=https://tu-proyecto.vercel.app
NEXTAUTH_SECRET=tu-clave-nextauth-secreta
\`\`\`

#### Variables de Entorno Opcionales (para funcionalidad completa):
\`\`\`
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/medischedule
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-password-app
TWILIO_ACCOUNT_SID=tu-twilio-sid
TWILIO_AUTH_TOKEN=tu-twilio-token
TWILIO_WHATSAPP_NUMBER=+14155238886
\`\`\`

### 4. Configuración de Build
Vercel detectará automáticamente que es un proyecto Next.js y usará la configuración correcta.

### 5. Dominio personalizado (opcional)
En el dashboard de Vercel, ve a Settings > Domains para configurar un dominio personalizado.

## Notas importantes

### Sin MongoDB
- El sistema funciona completamente con datos de ejemplo
- Se generan automáticamente 1000 profesionales y 2000 citas
- Todas las funcionalidades están disponibles

### Con MongoDB
- Configura MONGODB_URI para persistencia real
- Los datos se almacenarán en la base de datos
- Mejor rendimiento y escalabilidad

### Sin servicios externos
- Los emails se simulan (se muestran en consola)
- Los SMS/WhatsApp se simulan
- Todas las funcionalidades de UI funcionan normalmente

### Con servicios externos
- Emails reales vía SMTP
- SMS/WhatsApp reales vía Twilio
- Funcionalidad completa de notificaciones

## Credenciales de prueba

### Admin:
- Email: admin@medischedule.com
- Password: admin123

### Empresas:
- Hospital San Rafael: empresa1@medischedule.com / empresa123
- Clínica Norte: empresa2@medischedule.com / empresa123

### Profesionales:
- Cualquier profesional generado automáticamente
- Password por defecto: medico123

## Después del despliegue
1. Accede a tu URL de Vercel
2. Usa las credenciales de prueba
3. Explora todas las funcionalidades
4. Configura servicios opcionales según necesites
