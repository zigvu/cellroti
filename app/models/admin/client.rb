class Client < ActiveRecord::Base
	# For authority
	include Authority::Abilities

	after_create :auto_create_client_setting

  def auto_create_client_setting
    cs = create_client_setting
    Serializers::ClientSettingsSerializer.new(cs).resetAllSettings
  end

	has_one :client_setting, dependent: :destroy
	belongs_to :organization
	has_many :client_detectables, dependent: :destroy
	has_many :detectables, through: :client_detectables
	accepts_nested_attributes_for :client_detectables, allow_destroy: true
end
