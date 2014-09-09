class DetGroupDetectable < ActiveRecord::Base
  belongs_to :det_group
  belongs_to :detectable
end
