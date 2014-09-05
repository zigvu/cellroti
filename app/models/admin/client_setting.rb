class ClientSetting < ActiveRecord::Base
	serialize :brands, Hash
	
	belongs_to :client
end
