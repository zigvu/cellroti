class ClientDetectable < ActiveRecord::Base
  belongs_to :client, touch: true
  belongs_to :detectable
end
