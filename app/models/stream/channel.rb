class Channel < ActiveRecord::Base
  # For authority
  include Authority::Abilities

  has_many :videos
end
