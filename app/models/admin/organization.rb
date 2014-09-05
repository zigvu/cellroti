class Organization < ActiveRecord::Base
	# For authority
	include Authority::Abilities
	#self.authorizer_name = 'PopulateAuthorizer'

	# detectables_list allows to get it in form input when creating organization
	attr_accessor :detectables_list

	has_many :detectables
	accepts_nested_attributes_for :detectables, allow_destroy: true, reject_if: :all_blank
	has_one :client
	belongs_to :user, foreign_key: :creator_id
end
