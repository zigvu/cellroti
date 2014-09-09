class DetGroup < ActiveRecord::Base
  belongs_to :user
  has_many :det_group_detectables, dependent: :destroy
  has_many :detectables, through: :det_group_detectables
end
