import nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export interface EmailOptions {
  to: string
  subject: string
  html: string
  from?: string
}

export async function sendEmail(options: EmailOptions) {
  try {
    const info = await transporter.sendMail({
      from: options.from || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    })

    console.log("Email sent:", info.messageId)
    return info
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

export function generateAppointmentEmailHTML(appointment: any) {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Cita</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9f9f9; }
        .appointment-details { background: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>MediSchedule</h1>
          <p>Confirmación de Cita Médica</p>
        </div>
        <div class="content">
          <p>Estimado/a ${appointment.patientName},</p>
          <p>Su cita médica ha sido ${appointment.status === "confirmed" ? "confirmada" : "actualizada"}.</p>
          
          <div class="appointment-details">
            <h3>Detalles de la Cita:</h3>
            <p><strong>Doctor:</strong> ${appointment.doctorName}</p>
            <p><strong>Especialidad:</strong> ${appointment.specialty}</p>
            <p><strong>Fecha:</strong> ${appointment.date}</p>
            <p><strong>Hora:</strong> ${appointment.time}</p>
            <p><strong>Duración:</strong> ${appointment.duration || 30} minutos</p>
            <p><strong>Ubicación:</strong> ${appointment.location || "Consultorio"}</p>
            ${appointment.notes ? `<p><strong>Notas:</strong> ${appointment.notes}</p>` : ""}
          </div>
          
          <p>Por favor, llegue 15 minutos antes de su cita.</p>
          <p>Si necesita cancelar o reprogramar, contáctenos con al menos 24 horas de anticipación.</p>
        </div>
        <div class="footer">
          <p>Este es un mensaje automático, por favor no responda a este email.</p>
          <p>MediSchedule - Sistema de Gestión de Citas Médicas</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Mejorar los templates de email y agregar más variaciones
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
            <p><strong>📅 Fecha:</strong> ${appointment.date}</p>
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
