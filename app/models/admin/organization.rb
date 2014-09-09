class Organization < ActiveRecord::Base
	# For authority
	include Authority::Abilities
	#self.authorizer_name = 'PopulateAuthorizer'

	has_many :detectables
	accepts_nested_attributes_for :detectables, allow_destroy: true, reject_if: :all_blank
	has_one :client
end
