import twilio from "twilio";
import { logger } from "./logger";

export function isTwilioConfigured(): boolean {
  return !!(
    process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_VERIFY_SERVICE_SID
  );
}

const twilioClient = isTwilioConfigured()
  ? twilio(process.env.TWILIO_ACCOUNT_SID!, process.env.TWILIO_AUTH_TOKEN!)
  : null;

export async function sendOtp(phone: string): Promise<boolean> {
  if (!twilioClient) {
    logger.error("SMS", "Twilio is not configured");
    return false;
  }
  try {
    await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verifications.create({ to: phone, channel: "sms" });
    return true;
  } catch (e: any) {
    logger.error("SMS", `Failed to send OTP: ${e.message}`);
    return false;
  }
}

export async function verifyOtp(phone: string, code: string): Promise<boolean> {
  if (!twilioClient) {
    logger.error("SMS", "Twilio is not configured");
    return false;
  }
  try {
    const result = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID!)
      .verificationChecks.create({ to: phone, code });
    return result.status === "approved";
  } catch (e: any) {
    logger.error("SMS", `Failed to verify OTP: ${e.message}`);
    return false;
  }
}
