class ExampleMailer < ActionMailer::Base
  #default from: "accounts@zigvu.com"

  def sample_email(user)
    @user = user
    emailFrom = Rails.application.config.action_mailer.smtp_settings[:user_name]
    mail(from: emailFrom, to: @user.email, subject: 'Sample Email')
  end
end
