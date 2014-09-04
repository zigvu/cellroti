class Detectable < ActiveRecord::Base
  belongs_to :organization
  belongs_to :user, foreign_key: :creator_id
end
