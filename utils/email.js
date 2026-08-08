const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendOtpEmail = async (email, otp) => {
  try {
    const { data, error } = await resend.emails.send({
      from:"SAGE <onboarding@resend.dev>",
      to: [email],
      subject: "Your SAGE Verification OTP",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <h2>SAGE Email Verification</h2>
          <p>Your OTP is:</p>
          <h1>${otp}</h1>
          <p>This OTP is valid for a limited time.</p>
        </div>
      `,
    });

    if (error) {
      console.error("Resend error:", error);
      throw new Error("Failed to send email");
    }

    return data;
  } catch (error) {
    console.error("Email error:", error);
    throw error;
  }
};

module.exports = sendOtpEmail;