class User < ActiveRecord::Base
	# For rolify
  rolify
	# For authority
  include Authority::UserAbilities

  # Devise token authentication for API
  acts_as_token_authenticatable
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable

  after_create :assign_default_role
  after_create :auto_create_user_setting

  def assign_default_role
    add_role(States::Roles.guest_user)
  end

  def auto_create_user_setting
    create_user_setting
    settings.resetAllSettings
  end

  def settings
    Serializers::UserSettingsSerializer.new(user_setting)
  end

  has_one :user_setting, dependent: :destroy
  belongs_to :client
end
