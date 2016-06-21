class ClientSetting < ActiveRecord::Base
  serialize :seasons, Hash
  serialize :jobs, Hash

  belongs_to :client
end
