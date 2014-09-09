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

  has_many :det_groups, dependent: :destroy
  has_many :detectables, through: :det_groups
end
