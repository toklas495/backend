const templates = {
    // "key":{sub:<>,body:<>},
    "verify-email": {
        sub: "Verify your email for 404",
        body: `<!doctype html>
                <html lang="en">
                <head>
                  <meta charset="utf-8">
                  <title>Verify your email</title>
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <style>
                    @media (prefers-color-scheme: dark) {
                      body, table, td { background:#0b0b0c !important; color:#ffffff !important; }
                      a.btn { background:#4f46e5 !important; color:#ffffff !important; }
                    }
                  </style>
                </head>
                <body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
                  <!-- Preheader (hidden) -->
                  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
                    Confirm your email to finish setting up 404.
                  </div>

                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:24px;">
                    <tr>
                      <td align="center">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
                          <tr>
                            <td style="padding:24px 24px 0;">
                              <div style="font-size:18px;font-weight:700;color:#111827;">404</div>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:24px;">
                              <h1 style="margin:0 0 8px 0;font-size:22px;line-height:28px;color:#111827;">Verify your email</h1>
                              <p style="margin:0 0 16px 0;line-height:1.6;">
                                Hi , thanks for signing up for <strong>404</strong>! Please confirm this email address to secure your account.
                              </p>

                              <!-- Primary button -->
                              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0 8px 0;">
                                <tr>
                                  <td>
                                    <a class="btn" href="{{__LINK__}}" 
                                       style="background:#4f46e5;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:600;">
                                      Verify email
                                    </a>
                                  </td>
                                </tr>
                              </table>

                              <!-- Fallback link -->
                              <p style="margin:12px 0 0 0;font-size:12px;color:#6b7280;">
                                If the button doesn’t work, paste this link into your browser:<br>
                                <a href="{{__LINK__}}" style="color:#4f46e5;word-break:break-all;">{{verifyUrl}}</a>
                              </p>

                              <p style="margin:24px 0 0 0;font-size:12px;color:#6b7280;">
                                This link will expire in {{__EXPIRE__}} minutes for your security.
                              </p>
                            </td>
                          </tr>
                          <tr>
                            <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
                              Need help? Contact us at <a href="mailto:{{__SUPPORT__}}" style="color:#4f46e5;">{{__SUPPORT__}}}}</a>.
                            </td>
                          </tr>
                        </table>
                        <div style="font-size:12px;color:#9ca3af;margin-top:12px;">You received this email because a sign-up was requested for 404.</div>
                      </td>
                    </tr>
                  </table>
                </body>
                </html>
                `
    },

    "2-step-verify":{
        sub:"Your 404 verification code",
        body:`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Your verification code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    @media (prefers-color-scheme: dark) {
      body, table, td { background:#0b0b0c !important; color:#ffffff !important; }
      .code { background:#111827 !important; color:#ffffff !important; border-color:#374151 !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
    Use this one-time code to finish signing in to 404.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:24px 24px 0;">
              <div style="font-size:18px;font-weight:700;color:#111827;">404</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;line-height:28px;color:#111827;">Your verification code</h1>
              <p style="margin:0 0 16px 0;line-height:1.6;">
                Hi , use the code below to complete your sign-in. This code works once and expires in {{__EXPIRE__}} minutes.
              </p>

              <!-- OTP block -->
              <div class="code" style="font-family:Consolas,Menlo,Monaco,monospace;font-size:28px;letter-spacing:6px;background:#f3f4f6;border:1px solid #e5e7eb;border-radius:10px;padding:16px 20px;text-align:center;margin:12px 0 8px 0;">
                {{__OTP__}}
              </div>

              <p style="margin:12px 0 0 0;font-size:12px;color:#6b7280;">
                Do not share this code. If you didn’t request it, secure your account and contact support.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
              Need help? <a href="mailto:{{__SUPPORT__}}" style="color:#4f46e5;">{{__SUPPORT__}}</a>
            </td>
          </tr>
        </table>
        <div style="font-size:12px;color:#9ca3af;margin-top:12px;">This is a transactional security email from 404.</div>
      </td>
    </tr>
  </table>
</body>
</html>
`
    },

    "welcome":{
        sub:"Welcome to 404 🎉",
        body:`<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Welcome to 404</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    @media (prefers-color-scheme: dark) {
      body, table, td { background:#0b0b0c !important; color:#ffffff !important; }
      a.btn { background:#10b981 !important; color:#0b0b0c !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background:#f5f7fb;font-family:Arial,Helvetica,sans-serif;color:#1f2937;">
  <div style="display:none;overflow:hidden;line-height:1px;opacity:0;max-height:0;max-width:0;">
    You're in! Here’s how to get started with 404.
  </div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f7fb;padding:24px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e5e7eb;">
          <tr>
            <td style="padding:24px 24px 0;">
              <div style="font-size:18px;font-weight:700;color:#111827;">404</div>
            </td>
          </tr>
          <tr>
            <td style="padding:24px;">
              <h1 style="margin:0 0 8px 0;font-size:22px;line-height:28px;color:#111827;">
                Welcome, 🎉
              </h1>
              <p style="margin:0 0 16px 0;line-height:1.6;">
                We’re excited to have you at <strong>404</strong>. Here are a few quick steps to get the most out of your account.
              </p>

              <!-- CTA Button -->
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:16px 0;">
                <tr>
                  <td>
                    <a class="btn" href="{{__LINK__}}" 
                       style="background:#10b981;color:#0b0b0c;text-decoration:none;padding:12px 20px;border-radius:8px;display:inline-block;font-weight:700;">
                      Get Started
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Feature bullets -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-top:8px;">
                <tr>
                  <td style="padding:4px 0;font-size:14px;">✅ Set up your profile</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:14px;">✅ Explore your dashboard</td>
                </tr>
                <tr>
                  <td style="padding:4px 0;font-size:14px;">✅ Enable 2-step verification</td>
                </tr>
              </table>

              <p style="margin:20px 0 0 0;line-height:1.6;">
                Have questions? We’re here to help — reply to this email or reach us at 
                <a href="mailto:{{__SUPPORT__}}" style="color:#4f46e5;">{{__SUPPORT__}}</a>.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:16px 24px;background:#f9fafb;border-top:1px solid #e5e7eb;font-size:12px;color:#6b7280;">
              Cheers,<br>The 404 Team
            </td>
          </tr>
        </table>
        <div style="font-size:12px;color:#9ca3af;margin-top:12px;">You’re receiving this because you created an account with {{appName}}.</div>
      </td>
    </tr>
  </table>
</body>
</html>
`
    },

    "test":{
        sub:"test email",
        body:`<html>
  <body>
    <p>Hello test,</p>
    <p><a href="https://example.com">test url</a></p>
  </body>
</html>
`
    }
}

export default templates;