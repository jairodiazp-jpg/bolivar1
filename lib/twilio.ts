import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

if (!accountSid || !authToken || !whatsappNumber) {
  console.warn("Twilio credentials not found. WhatsApp notifications will be simulated.")
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export interface WhatsAppMessage {
  to: string
  message: string
}

export async function sendWhatsAppMessage({ to, message }: WhatsAppMessage): Promise<boolean> {
  try {
    if (!client || !whatsappNumber) {
      // Simular envío si no hay credenciales
      console.log(`💬 WhatsApp simulado a ${to}: ${message}`)
      return true
    }

    const result = await client.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${to}`,
      body: message,
    })

    console.log(`✅ WhatsApp enviado: ${result.sid}`)
    return true
  } catch (error) {
    console.error("Error enviando WhatsApp:", error)
    return false
  }
}

export function formatAppointmentWhatsApp(appointment: any): string {
  return `🏥 *Confirmación de Cita Médica*

¡Hola ${appointment.patientName}! 👋

Tu cita ha sido programada exitosamente:

👨‍⚕️ *Profesional:* ${appointment.doctorName}
🩺 *Especialidad:* ${appointment.specialty}
📅 *Fecha:* ${new Date(appointment.date).toLocaleDateString("es-ES", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })}
⏰ *Hora:* ${appointment.time}
⏱️ *Duración:* ${appointment.duration || 30} minutos
📍 *Lugar:* ${appointment.location || "Clínica"}
📋 *Tipo:* ${appointment.type}

${appointment.notes ? `📝 *Notas:* ${appointment.notes}\n\n` : ""}*Instrucciones importantes:*
• Llega 15 minutos antes de tu cita
• Trae tu documento de identidad
• Si tienes exámenes previos, tráelos contigo
• Para cancelar, hazlo con 24h de anticipación

📞 *Contacto:* +57 (1) 234-5678
📧 *Email:* citas@medischedule.com

¡Te esperamos! 😊`
}

export function formatAppointmentReminder(appointment: any): string {
  return `⏰ *Recordatorio de Cita*

Hola ${appointment.patientName},

Te recordamos que tienes una cita mañana:

👨‍⚕️ ${appointment.doctorName}
📅 ${new Date(appointment.date).toLocaleDateString("es-ES")}
⏰ ${appointment.time}
📍 ${appointment.location}

¡No olvides llegar 15 minutos antes!

MediSchedule 🏥`
}

export function formatAppointmentCancellation(appointment: any): string {
  return `❌ *Cita Cancelada*

Hola ${appointment.patientName},

Tu cita ha sido cancelada:

👨‍⚕️ ${appointment.doctorName}
📅 ${new Date(appointment.date).toLocaleDateString("es-ES")}
⏰ ${appointment.time}

Para reprogramar, contáctanos:
📞 +57 (1) 234-5678

MediSchedule 🏥`
}
