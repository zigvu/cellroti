class User < ActiveRecord::Base
	# For rolify
  rolify
	# For authority
  include Authority::UserAbilities
  # Include default devise modules. Others available are:
  # :confirmable, :lockable, :timeoutable and :omniauthable
  devise :database_authenticatable, :registerable, :recoverable, :rememberable, :trackable, :validatable

  after_create :assign_default_role

  def assign_default_role
    add_role(States::Roles.guest_user)
  end

  belongs_to :client
end
