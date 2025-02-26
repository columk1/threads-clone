const logoSrc = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTojg1TJp0qn4kkGj3Jeut8WNMs5O9uuDkvsg&s'

export const verificationEmailTemplate = (name: string, email: string, code: string) => `
  <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #fff; color: #000;">
    <div style="margin-bottom: 24px;">
      <img src="${logoSrc}" alt="Threads Logo" style="width: 36px; height: 36px;"/>
  <div style="width: 100%; height: 1px; background-color: #ddd; margin-top: 10px;"</div>
    </div>
    
    <h1 style="font-size: 24px; font-weight: bold; margin-bottom: 24px;">One more step to sign up</h1>
    
    <p style="font-size: 16px; margin-bottom: 16px;">Hi ${name},</p>
    
    <p style="font-size: 16px; margin-bottom: 40px;">We got your request to create an account. Here's your confirmation code:</p>
    
    <div style="border: 1px solid #ccc; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px; background-color: #f5f5f5;">
      <span style="font-size: 20px; letter-spacing: 2px; font-weight: 500;">${code}</span>
    </div>
    
    <p style="color: #85878B; font-size: 12px; margin-bottom: 40px; text-align: center;">Don't share this code with anyone.</p>
    
    <div style="margin-bottom: 24px;">
      <p style="font-size: 16px; font-weight: bold; margin-bottom: 0px; line-height: 21px;">If someone asks for this code</p>
      <p style="font-size: 16px; margin: 0; line-height: 21px;">Don't share this code with anyone.</p>
    </div>
    
    <p style="font-size: 16px; margin-bottom: 0; line-height: 21px;">Thanks,</p>
    <span style="font-size: 16px; margin-bottom: 24px;">Threads Clone Security</span>
    
    <hr style="border: none; border-top: 1px solid #ddd; margin: 24px 0;"/>
    
    <div style="text-align: center; color: #85878B; font-size: 10px;">
      <p style="margin-bottom: 12px;">from</p>
      <img src="${logoSrc}" alt="Threads" style="width: 16px;"/>
      <p style="margin-bottom: 8px;">Threads Clone</p>
      <p style="margin-bottom: 16px;">This message was sent to <a href="mailto:${email}">${email}</a>.</p>
      <p>To help keep your account secure, please don't forward this email.</p>
    </div>
  </div>
`
