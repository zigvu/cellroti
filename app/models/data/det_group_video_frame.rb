class DetGroupVideoFrame < ActiveRecord::Base
  belongs_to :det_group
  belongs_to :video_frame
end
