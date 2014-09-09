class ClientDetectable < ActiveRecord::Base
  belongs_to :client
  belongs_to :detectable
end
