import twilio from "twilio"

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER || "whatsapp:+14155238886"

let client: twilio.Twilio | null = null

if (accountSid && authToken) {
  client = twilio(accountSid, authToken)
}

export interface WhatsAppMessage {
  to: string
  message: string
}

export async function sendWhatsAppMessage(options: WhatsAppMessage) {
  if (!client) {
    console.warn("Twilio not configured, skipping WhatsApp message")
    return null
  }

  try {
    const message = await client.messages.create({
      body: options.message,
      from: whatsappNumber,
      to: `whatsapp:${options.to}`,
    })

    console.log("WhatsApp message sent:", message.sid)
    return message
  } catch (error) {
    console.error("Error sending WhatsApp message:", error)
    throw error
  }
}

export function formatAppointmentWhatsApp(appointment: any) {
  return `
🏥 *MediSchedule - Confirmación de Cita*

Estimado/a ${appointment.patientName},

Su cita médica ha sido confirmada:

👨‍⚕️ *Doctor:* ${appointment.doctorName}
🩺 *Especialidad:* ${appointment.specialty}
📅 *Fecha:* ${appointment.date}
🕐 *Hora:* ${appointment.time}
⏱️ *Duración:* ${appointment.duration || 30} minutos
📍 *Ubicación:* ${appointment.location || "Consultorio"}

Por favor, llegue 15 minutos antes de su cita.

Para cancelar o reprogramar, contáctenos con 24h de anticipación.

¡Gracias por confiar en nosotros! 🙏
  `.trim()
}
