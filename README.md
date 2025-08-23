# 🏥 MediSchedule - Sistema de Agendamiento Médico

Sistema completo de agendamiento médico con funcionalidades avanzadas para empresas, profesionales médicos y administradores.

## 🚀 Características Principales

### ✅ **Funcionalidades Implementadas**

- **🔐 Autenticación JWT** con middleware de protección
- **📊 Dashboard Administrativo** con métricas en tiempo real
- **🏢 Gestión Multi-empresa** con vistas independientes
- **👨‍⚕️ Gestión de Profesionales** con carga masiva
- **📅 Calendario Avanzado** con drag & drop
- **📧 Notificaciones por Email** automáticas (con fallback)
- **💬 WhatsApp con Twilio** para confirmaciones (con fallback)
- **📄 Reportes PDF** profesionales con 4 tipos
- **🗄️ Base de datos MongoDB** con datos de ejemplo
- **🎨 Diseño Responsive** con colores corporativos

### 🎯 **Tipos de Usuario**

1. **Administrador**: Dashboard completo, gestión de empresas, métricas globales
2. **Empresas (3)**: Gestión de profesionales, citas, reportes por empresa
3. **Profesionales**: Agenda personal, registro de horas, perfil individual

## 🛠️ **Tecnologías Utilizadas**

- **Frontend**: Next.js 14, React, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes, MongoDB (con fallback a datos mock)
- **UI**: shadcn/ui components
- **Notificaciones**: Nodemailer, Twilio WhatsApp (con simulación)
- **Reportes**: jsPDF con tablas automáticas
- **Autenticación**: JWT con middleware

## 📦 **Instalación Rápida**

1. **Clonar e instalar**
\`\`\`bash
git clone <repository-url>
cd medical-appointment-system
npm install
\`\`\`

2. **Configurar variables básicas**
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edita `.env.local` con al menos:
\`\`\`env
JWT_SECRET=tu-clave-secreta-jwt-muy-segura
\`\`\`

3. **Ejecutar**
\`\`\`bash
npm run dev
\`\`\`

¡Listo! El sistema funciona con datos de ejemplo sin necesidad de configurar servicios externos.

## 🔧 **Configuración Opcional de Servicios**

### **MongoDB (Opcional)**
- **Sin configurar**: Usa datos de ejemplo en memoria
- **Local**: `mongodb://localhost:27017/medischedule`
- **Cloud**: MongoDB Atlas URI

### **Email (Opcional)**
- **Sin configurar**: Simula envíos en consola
- **Gmail**: Habilita 2FA y genera contraseña de app
- **Otros**: Configura SMTP personalizado

### **Twilio WhatsApp (Opcional)**
- **Sin configurar**: Simula envíos en consola
- **Con Twilio**: Configura Sandbox de WhatsApp

## 👥 **Credenciales de Prueba**

\`\`\`
🔑 Administrador:
- Email: admin@medischedule.com
- Password: admin123

🏢 Empresa 1:
- Email: empresa1@medischedule.com
- Password: empresa123

👨‍⚕️ Profesional:
- Email: doctor@medischedule.com
- Password: doctor123
\`\`\`

## 📊 **Funcionalidades Detalladas**

### **Dashboard Administrativo**
- ✅ Métricas globales del sistema
- ✅ Gestión de empresas registradas
- ✅ Top profesionales por rendimiento
- ✅ 4 tipos de reportes PDF

### **Panel de Empresas**
- ✅ Vista exclusiva por empresa
- ✅ Carga masiva de profesionales (simulada)
- ✅ Gestión completa de citas médicas
- ✅ Calendario visual con drag & drop
- ✅ Reportes personalizados

### **Panel de Profesionales**
- ✅ Perfil personal completo
- ✅ Agenda diaria y mensual
- ✅ Registro de horas trabajadas
- ✅ Vista de citas con estados

### **Sistema de Citas Avanzado**
- ✅ Calendario interactivo con drag & drop
- ✅ Estados: Confirmada, Pendiente, Cancelada
- ✅ Formularios modales completos
- ✅ Validación de campos requeridos
- ✅ Colores pastel por especialidad
- ✅ Notificaciones automáticas

### **Reportes PDF Profesionales**
- **📋 Reporte de Citas**: Filtros por fecha, estado, profesional con métricas
- **👥 Reporte de Profesionales**: Estado, rendimiento, horas trabajadas
- **💰 Reporte Financiero**: Ingresos, gastos, rentabilidad (solo admin)
- **📊 Reporte de Métricas**: KPIs y indicadores de rendimiento
- Diseño profesional con logo corporativo
- Descarga automática en PDF
- Reportes rápidos predefinidos

## 🎨 **Diseño**

### **Colores Corporativos**
- 🟢 Verde principal: `#15803d` (botones, headers)
- 🟡 Amarillo corporativo: `#eab308` (acentos)
- ⚪ Fondo: Blanco con grises suaves

### **Especialidades con Colores Pastel**
- 💗 Cardiología: Rosa suave
- 💙 Pediatría: Azul suave  
- 💜 Neurología: Púrpura suave
- 🩷 Ginecología: Rosa pastel
- 🧡 Dermatología: Naranja suave
- 🩵 Oftalmología: Cian suave

## 🔒 **Seguridad**

- **JWT Authentication** con expiración de 24h
- **Middleware de protección** por tipo de usuario
- **Validación de rutas** según permisos
- **Sanitización de datos** en formularios
- **Manejo seguro de errores**

## 📱 **Responsive Design**

- ✅ Diseño adaptativo para móviles, tablets y desktop
- ✅ Componentes optimizados para touch
- ✅ Navegación intuitiva en todos los dispositivos
- ✅ Modales responsivos con scroll

## 🚀 **Despliegue**

### **Vercel (Recomendado)**
\`\`\`bash
npm run build
vercel --prod
\`\`\`

### **Variables de Entorno en Producción**
Solo es **obligatorio** configurar:
\`\`\`env
JWT_SECRET=tu-clave-muy-segura-para-produccion
\`\`\`

Las demás variables son opcionales y el sistema funciona con simulaciones.

## 🔄 **Datos de Ejemplo Incluidos**

El sistema incluye datos completos de ejemplo:
- **5 Profesionales** de diferentes especialidades
- **5 Citas** con diferentes estados
- **3 Empresas** con información completa
- **Métricas simuladas** para reportes
- **Transacciones financieras** de ejemplo

## 📞 **Soporte y Desarrollo**

### **Estructura del Proyecto**
\`\`\`
medical-appointment-system/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── admin/             # Dashboard Admin
│   ├── empresa/           # Dashboard Empresa
│   └── profesional/       # Dashboard Profesional
├── components/            # Componentes React
│   ├── ui/               # shadcn/ui components
│   ├── advanced-calendar.tsx
│   └── reports-dashboard.tsx
├── lib/                   # Utilidades
│   ├── mongodb.ts        # DB con fallback
│   ├── email.ts          # Email con simulación
│   ├── twilio.ts         # WhatsApp con simulación
│   └── pdf-generator.ts  # Generador de PDFs
└── middleware.ts         # Protección de rutas
\`\`\`

### **Comandos Útiles**
\`\`\`bash
npm run dev          # Desarrollo
npm run build        # Construcción
npm run start        # Producción
npm run lint         # Linting
\`\`\`

## 🔄 **Próximas Funcionalidades**

- [ ] 📱 App móvil nativa
- [ ] 🔔 Notificaciones push
- [ ] 📊 Dashboard de métricas avanzadas
- [ ] 🤖 IA para optimización de horarios
- [ ] 💳 Integración con sistemas de pago
- [ ] 📋 Historias clínicas digitales
- [ ] 🎥 Telemedicina integrada
- [ ] 📈 Analytics avanzados

## 🐛 **Solución de Problemas**

### **Problemas Comunes**

1. **Error de JWT**: Verifica que `JWT_SECRET` esté configurado
2. **Problemas de MongoDB**: El sistema usa datos mock automáticamente
3. **Emails no llegan**: Revisa configuración SMTP o usa simulación
4. **WhatsApp no funciona**: Verifica credenciales Twilio o usa simulación

### **Logs del Sistema**
El sistema muestra logs claros en consola:
- ✅ Operaciones exitosas
- ❌ Errores con detalles
- 📝 Uso de datos mock cuando corresponde
- 📧 Estado de notificaciones

## 🎯 **Casos de Uso**

### **Para Clínicas Pequeñas**
- Gestión básica de citas
- Control de profesionales
- Reportes simples

### **Para Centros Médicos**
- Multi-especialidad
- Gestión avanzada
- Reportes detallados

### **Para Hospitales**
- Gestión compleja
- Múltiples empresas
- Analytics completos

---

**MediSchedule** - Transformando la gestión médica con tecnología moderna 🏥✨

### **¡Sistema Completamente Funcional!**

✅ **Instalación en 3 pasos**  
✅ **Funciona sin configuración externa**  
✅ **Datos de ejemplo incluidos**  
✅ **Listo para producción**  

¡Pruébalo ahora mismo! 🚀
