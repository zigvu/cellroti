class ExampleMailer < ActionMailer::Base
  #default from: "accounts@zigvu.com"

  def sample_email(user)
    @user = user
    mailerSetting = YAML.load_file(Rails.root.join('config','mailer.yml'))[Rails.env]
    emailFrom = mailerSetting["user_name"]
    mail(from: emailFrom, to: @user.email, subject: 'Sample Email')
  end
end
