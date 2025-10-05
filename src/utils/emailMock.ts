/**
 * SISTEMA DE EMAIL MOCK
 * Simula el envío de emails para recuperación de contraseña
 */

interface EmailData {
  to: string;
  subject: string;
  body: string;
  template?: string;
}

interface EmailResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

// Simulación de base de datos de emails enviados
const emailLog: Array<EmailData & { sentAt: string; messageId: string }> = [];

export const sendEmail = async (emailData: EmailData): Promise<EmailResponse> => {
  try {
    // Simular delay de red (1-3 segundos)
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 1000));
    
    // Generar ID único para el email
    const messageId = `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Registrar email en el log
    emailLog.push({
      ...emailData,
      sentAt: new Date().toISOString(),
      messageId
    });
    
    // Simular éxito (90% de éxito, 10% de error)
    if (Math.random() > 0.1) {
      console.log(`📧 Email enviado: ${emailData.to} - ${emailData.subject}`);
      return {
        success: true,
        messageId
      };
    } else {
      return {
        success: false,
        error: 'Error temporal del servidor de email'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'Error interno del sistema de email'
    };
  }
};

export const sendPasswordResetEmail = async (email: string, resetToken: string): Promise<EmailResponse> => {
  const resetLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;
  
  const emailData: EmailData = {
    to: email,
    subject: 'Recuperación de contraseña - Airbnb',
    template: 'password-reset',
    body: `
      <h2>Recuperación de contraseña</h2>
      <p>Hola,</p>
      <p>Recibiste este email porque solicitaste recuperar tu contraseña.</p>
      <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
      <a href="${resetLink}" style="background: #FF385C; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px;">
        Restablecer contraseña
      </a>
      <p>Este enlace expirará en 24 horas.</p>
      <p>Si no solicitaste este cambio, ignora este email.</p>
      <br>
      <p>Saludos,<br>Equipo de Airbnb</p>
    `
  };
  
  return await sendEmail(emailData);
};

export const getEmailLog = (): typeof emailLog => {
  return emailLog;
};

export const clearEmailLog = (): void => {
  emailLog.length = 0;
};
