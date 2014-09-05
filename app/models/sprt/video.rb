class Video < ActiveRecord::Base
  belongs_to :game
  has_many :video_frames
end
