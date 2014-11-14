class DetGroup < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  validates :name, presence: true, uniqueness: true

  # Mock a has_many relationship with Mongoid models
  def det_group_metrics
    DetGroupMetric.where(det_group_id: self.id)
  end

  def summary_metrics
    SummaryMetric.where(det_group_id: self.id)
  end

  has_many :det_group_clients, dependent: :destroy
  has_many :clients, through: :det_group_clients

  has_many :det_group_detectables, dependent: :destroy
  has_many :detectables, through: :det_group_detectables
	accepts_nested_attributes_for :det_group_detectables, allow_destroy: true
end
