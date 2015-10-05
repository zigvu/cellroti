class UserSetting < ActiveRecord::Base
  serialize :seasonAnalysis, Hash

  belongs_to :user
end
