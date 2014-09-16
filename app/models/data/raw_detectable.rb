class RawDetectable < ActiveRecord::Base
  belongs_to :video_frame
  belongs_to :detectable
end
