class DetGroupClient < ActiveRecord::Base
  belongs_to :det_group, touch: true
  belongs_to :client, touch: true
end
