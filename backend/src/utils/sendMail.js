import { BrevoClient } from "@getbrevo/brevo";

const sendEmail = async ({ to, subject, html, text }) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.EMAIL_USER;
  const senderName = process.env.EMAIL_FROM || "Connectify";

  if (!to) {
    throw new Error("Recipient email address ('to') is required");
  }

  if (!apiKey) {
    console.warn("[Email Service] Warning: BREVO_API_KEY is not defined in environment variables.");
    throw new Error("Email service is not configured: BREVO_API_KEY missing");
  }

  if (apiKey.startsWith("xsmtpsib-")) {
    console.warn(
      "[Email Service] Notice: Your BREVO_API_KEY starts with 'xsmtpsib-'. " +
      "This is an SMTP relay key. Brevo REST API requires an API key starting with 'xkeysib-'. " +
      "Please generate an API key in Brevo: Dashboard > SMTP & API > API Keys."
    );
  }

  if (!senderEmail) {
    console.warn("[Email Service] Warning: EMAIL_USER (sender email) is not defined.");
    throw new Error("Email service is not configured: EMAIL_USER missing");
  }

  try {
    const brevo = new BrevoClient({
      apiKey: apiKey,
    });

    const sendPayload = {
      subject,
      htmlContent: html,
      textContent: text || html.replace(/<[^>]*>?/gm, ""),
      sender: {
        name: senderName,
        email: senderEmail,
      },
      replyTo: {
        name: senderName,
        email: senderEmail,
      },
      to: [{ email: to }],
    };

    const result = await brevo.transactionalEmails.sendTransacEmail(sendPayload);

    const messageId = result?.messageId || (result?.body && result.body.messageId);
    console.log(`[Email Service] Verification email dispatched successfully to ${to} (Message ID: ${messageId || "accepted"})`);

    return {
      success: true,
      messageId: messageId || "accepted",
      recipient: to,
    };
  } catch (error) {
    const errorDetails = error?.body?.message || error?.message || "Unknown email error";
    const statusCode = error?.status || error?.statusCode || 500;

    console.error(`[Email Service] Delivery failed to ${to} [Status ${statusCode}]: ${errorDetails}`);

    if (typeof errorDetails === "string" && errorDetails.toLowerCase().includes("sender")) {
      console.error(
        `[Email Service] Sender verification error: '${senderEmail}' must be verified in Brevo Dashboard > Senders & IP > Senders.`
      );
    }

    const emailErr = new Error(`Email sending failed: ${errorDetails}`);
    emailErr.statusCode = statusCode;
    emailErr.details = errorDetails;
    throw emailErr;
  }
};

export default sendEmail;
export { sendEmail };
