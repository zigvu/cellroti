class User < ActiveRecord::Base
  # For rolify
  rolify
  # For authority
  include Authority::UserAbilities

  # Devise token authentication for API
  acts_as_token_authenticatable
  # Include default devise modules. Others available are:
  # :confirmable, and :omniauthable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :timeoutable, :validatable, :lockable, :invitable

  after_create :assign_default_role
  after_create :auto_create_user_setting

  def assign_default_role
    add_role(States::Roles.guest_user) if self.roles.empty?
  end
  def update_role(newRole)
    if self.roles.first != newRole
      self.roles.destroy_all and self.add_role(newRole.name)
    else
      true
    end
  end

  def auto_create_user_setting
    create_user_setting
    settings.resetAllSettings
  end

  def settings
    Serializers::UserSettingsSerializer.new(user_setting)
  end

  def name
    "#{self.first_name} #{self.last_name}"
  end

  has_many :invitations, :class_name => self.to_s, :as => :invited_by
  has_one :user_setting, dependent: :destroy
  belongs_to :client
end
