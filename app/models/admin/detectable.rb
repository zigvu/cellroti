class Detectable < ActiveRecord::Base
  belongs_to :organization
	has_many :client_detectables, dependent: :destroy
  has_many :det_group_detectables, dependent: :destroy
end
