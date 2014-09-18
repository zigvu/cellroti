class ClientSetting < ActiveRecord::Base
	serialize :seasons, Hash
	
	belongs_to :client
end
