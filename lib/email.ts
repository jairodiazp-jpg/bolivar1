import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number.parseInt(process.env.SMTP_PORT || "587"),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions): Promise<boolean> {
  try {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
      // Simular envío si no hay credenciales
      console.log(`📧 Email simulado a ${to}: ${subject}`)
      return true
    }

    const info = await transporter.sendMail({
      from: `"MediSchedule" <${process.env.SMTP_USER}>`,
      to,
      subject,
      text,
      html,
    })

    console.log(`✅ Email enviado: ${info.messageId}`)
    return true
  } catch (error) {
    console.error("Error enviando email:", error)
    return false
  }
}

// Mejorar los templates de email y agregar más variaciones
export function generateAppointmentEmailHTML(appointment: any): string {
  const statusColors = {
    confirmed: { bg: "#dcfce7", border: "#16a34a", text: "#15803d" },
    pending: { bg: "#fef3c7", border: "#f59e0b", text: "#d97706" },
    cancelled: { bg: "#fee2e2", border: "#ef4444", text: "#dc2626" },
  }

  const statusColor = statusColors[appointment.status as keyof typeof statusColors] || statusColors.confirmed

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Confirmación de Cita - MediSchedule</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0;
          background-color: #f8fafc;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #15803d, #22c55e); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .header p { margin: 10px 0 0 0; font-size: 16px; opacity: 0.9; }
        .content { 
          padding: 40px 30px; 
        }
        .appointment-card { 
          background: ${statusColor.bg}; 
          border: 2px solid ${statusColor.border};
          border-radius: 12px; 
          padding: 25px; 
          margin: 25px 0; 
        }
        .appointment-card h2 { 
          color: ${statusColor.text}; 
          margin-top: 0; 
          font-size: 20px;
        }
        .detail-row { 
          display: flex; 
          justify-content: space-between; 
          align-items: center;
          margin: 15px 0; 
          padding: 12px 0; 
          border-bottom: 1px solid rgba(0,0,0,0.1); 
        }
        .detail-row:last-child { border-bottom: none; }
        .label { 
          font-weight: 600; 
          color: #374151; 
          font-size: 14px;
        }
        .value { 
          color: #15803d; 
          font-weight: 500;
          text-align: right;
        }
        .instructions { 
          background: #f0f9ff; 
          border-left: 4px solid #0ea5e9;
          padding: 20px; 
          border-radius: 8px; 
          margin: 25px 0;
        }
        .instructions h3 { 
          color: #0c4a6e; 
          margin-top: 0; 
          font-size: 16px;
        }
        .instructions ul { 
          color: #0c4a6e; 
          margin: 10px 0;
          padding-left: 20px;
        }
        .instructions li { margin: 8px 0; }
        .footer { 
          background: #f8fafc;
          text-align: center; 
          padding: 30px; 
          color: #6b7280; 
          font-size: 14px; 
          border-top: 1px solid #e5e7eb;
        }
        .contact-info {
          background: #f9fafb;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
        }
        .contact-info h4 {
          color: #374151;
          margin-top: 0;
        }
        .qr-placeholder {
          width: 100px;
          height: 100px;
          background: #e5e7eb;
          border-radius: 8px;
          margin: 20px auto;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          font-size: 12px;
        }
        @media (max-width: 600px) {
          .container { margin: 0; }
          .content { padding: 20px; }
          .header { padding: 30px 20px; }
          .detail-row { flex-direction: column; align-items: flex-start; }
          .value { text-align: left; margin-top: 5px; }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏥 MediSchedule</h1>
          <p>Tu cita ha sido ${appointment.status === "confirmed" ? "confirmada" : appointment.status === "pending" ? "programada" : "cancelada"}</p>
        </div>
        
        <div class="content">
          <div class="appointment-card">
            <h2>📋 Detalles de tu Cita</h2>
            <div class="detail-row">
              <span class="label">👤 Paciente</span>
              <span class="value">${appointment.patientName}</span>
            </div>
            <div class="detail-row">
              <span class="label">👨‍⚕️ Profesional</span>
              <span class="value">${appointment.doctorName}</span>
            </div>
            <div class="detail-row">
              <span class="label">🩺 Especialidad</span>
              <span class="value">${appointment.specialty}</span>
            </div>
            <div class="detail-row">
              <span class="label">📅 Fecha</span>
              <span class="value">${new Date(appointment.date).toLocaleDateString("es-ES", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}</span>
            </div>
            <div class="detail-row">
              <span class="label">⏰ Hora</span>
              <span class="value">${appointment.time}</span>
            </div>
            <div class="detail-row">
              <span class="label">⏱️ Duración</span>
              <span class="value">${appointment.duration || 30} minutos</span>
            </div>
            <div class="detail-row">
              <span class="label">📍 Ubicación</span>
              <span class="value">${appointment.location || "Clínica"}</span>
            </div>
            <div class="detail-row">
              <span class="label">📋 Tipo</span>
              <span class="value">${appointment.type}</span>
            </div>
            ${
              appointment.notes
                ? `
            <div class="detail-row">
              <span class="label">📝 Notas</span>
              <span class="value">${appointment.notes}</span>
            </div>
            `
                : ""
            }
          </div>
          
          ${
            appointment.status !== "cancelled"
              ? `
          <div class="instructions">
            <h3>📝 Instrucciones Importantes</h3>
            <ul>
              <li><strong>Puntualidad:</strong> Llega 15 minutos antes de tu cita</li>
              <li><strong>Documentos:</strong> Trae tu documento de identidad y carnet de salud</li>
              <li><strong>Exámenes:</strong> Si tienes exámenes previos, tráelos contigo</li>
              <li><strong>Cancelaciones:</strong> Para cancelar, hazlo con 24 horas de anticipación</li>
              <li><strong>Preparación:</strong> Sigue las indicaciones específicas de tu especialidad</li>
            </ul>
          </div>
          `
              : ""
          }
          
          <div class="contact-info">
            <h4>📞 ¿Necesitas ayuda?</h4>
            <p><strong>Teléfono:</strong> +57 (1) 234-5678</p>
            <p><strong>WhatsApp:</strong> +57 300 123 4567</p>
            <p><strong>Email:</strong> citas@medischedule.com</p>
            <p><strong>Horario:</strong> Lunes a Viernes 7:00 AM - 7:00 PM</p>
          </div>
          
          <div class="qr-placeholder">
            QR Code
          </div>
        </div>
        
        <div class="footer">
          <p><strong>MediSchedule</strong> - Sistema de Agendamiento Médico</p>
          <p>Este es un correo automático, por favor no responder directamente.</p>
          <p style="margin-top: 20px; font-size: 12px;">
            © ${new Date().getFullYear()} MediSchedule. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

export function generateCredentialsEmailHTML(professional: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Credenciales de Acceso - MediSchedule</title>
      <style>
        body { 
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
          line-height: 1.6; 
          color: #333; 
          margin: 0; 
          padding: 0;
          background-color: #f8fafc;
        }
        .container { 
          max-width: 600px; 
          margin: 0 auto; 
          background: white;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header { 
          background: linear-gradient(135deg, #15803d, #22c55e); 
          color: white; 
          padding: 40px 30px; 
          text-align: center; 
        }
        .content { padding: 40px 30px; }
        .credentials-card { 
          background: #f0f9ff; 
          border: 2px solid #0ea5e9;
          border-radius: 12px; 
          padding: 25px; 
          margin: 25px 0; 
        }
        .credential-item { 
          background: #ffffff; 
          padding: 15px; 
          margin: 15px 0; 
          border-radius: 8px; 
          font-family: 'Courier New', monospace;
          border: 1px solid #e5e7eb;
        }
        .credential-item strong { color: #374151; }
        .warning { 
          background: #fef2f2; 
          border: 2px solid #fecaca; 
          padding: 20px; 
          border-radius: 8px; 
          color: #991b1b; 
          margin: 20px 0;
        }
        .warning h4 { margin-top: 0; color: #991b1b; }
        .button { 
          background: #15803d; 
          color: white; 
          padding: 15px 30px; 
          text-decoration: none; 
          border-radius: 8px; 
          display: inline-block; 
          margin: 20px 0;
          font-weight: 600;
        }
        .footer { 
          background: #f8fafc;
          text-align: center; 
          padding: 30px; 
          color: #6b7280; 
          font-size: 14px; 
          border-top: 1px solid #e5e7eb;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Credenciales de Acceso</h1>
          <p>Bienvenido al Sistema MediSchedule</p>
        </div>
        
        <div class="content">
          <h2>¡Hola ${professional.name}! 👋</h2>
          <p>Te damos la bienvenida al sistema de agendamiento médico más avanzado. A continuación encontrarás tus credenciales de acceso:</p>
          
          <div class="credentials-card">
            <h3>🔑 Datos de Acceso</h3>
            <div class="credential-item">
              <strong>👤 Usuario:</strong> ${professional.credentials.username}
            </div>
            <div class="credential-item">
              <strong>🔒 Contraseña:</strong> ${professional.credentials.password}
            </div>
            <div class="credential-item">
              <strong>🌐 URL de Acceso:</strong> https://medischedule.com/profesional
            </div>
            <div class="credential-item">
              <strong>🏢 Empresa:</strong> ${professional.companyName}
            </div>
            <div class="credential-item">
              <strong>🩺 Especialidad:</strong> ${professional.specialty}
            </div>
          </div>
          
          <div class="warning">
            <h4>⚠️ Importante - Seguridad</h4>
            <ul>
              <li><strong>Primera vez:</strong> Cambia tu contraseña en el primer acceso</li>
              <li><strong>Confidencialidad:</strong> No compartas estas credenciales con nadie</li>
              <li><strong>Seguridad:</strong> Usa una contraseña fuerte y única</li>
              <li><strong>Sesión:</strong> Cierra sesión al terminar de usar el sistema</li>
              <li><strong>Soporte:</strong> Contacta a soporte si tienes problemas de acceso</li>
            </ul>
          </div>
          
          <div style="text-align: center;">
            <a href="https://medischedule.com/profesional" class="button">🚀 Acceder al Sistema</a>
          </div>
          
          <h3>📋 Funcionalidades Disponibles:</h3>
          <ul>
            <li>📅 <strong>Agenda Personal:</strong> Ve todas tus citas programadas</li>
            <li>⏰ <strong>Horarios:</strong> Gestiona tu disponibilidad</li>
            <li>👥 <strong>Pacientes:</strong> Accede al historial de citas</li>
            <li>📊 <strong>Estadísticas:</strong> Ve tu rendimiento y métricas</li>
            <li>📱 <strong>Notificaciones:</strong> Recibe alertas importantes</li>
          </ul>
          
          <p>Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos. ¡Estamos aquí para apoyarte!</p>
          <p><strong>¡Bienvenido al equipo MediSchedule!</strong> 🎉</p>
        </div>
        
        <div class="footer">
          <p><strong>Soporte Técnico</strong></p>
          <p>📞 +57 (1) 234-5678 | 📧 soporte@medischedule.com</p>
          <p>🕒 Lunes a Viernes 8:00 AM - 6:00 PM</p>
          <p style="margin-top: 20px; font-size: 12px;">
            © ${new Date().getFullYear()} MediSchedule. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Agregar template para recordatorios
export function generateReminderEmailHTML(appointment: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Recordatorio de Cita - MediSchedule</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f59e0b, #eab308); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #fffbeb; padding: 30px; border-radius: 0 0 10px 10px; }
        .reminder-card { background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⏰ Recordatorio de Cita</h1>
          <p>No olvides tu cita de mañana</p>
        </div>
        <div class="content">
          <div class="reminder-card">
            <h2>Tu cita es mañana</h2>
            <p><strong>👨‍⚕️ Profesional:</strong> ${appointment.doctorName}</p>
            <p><strong>📅 Fecha:</strong> ${new Date(appointment.date).toLocaleDateString("es-ES")}</p>
            <p><strong>⏰ Hora:</strong> ${appointment.time}</p>
            <p><strong>📍 Lugar:</strong> ${appointment.location}</p>
            <p style="margin-top: 20px; padding: 15px; background: #fef3c7; border-radius: 6px;">
              <strong>💡 Recuerda:</strong> Llega 15 minutos antes de tu cita
            </p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `
}
