class DetGroup < ActiveRecord::Base
	# For authority
	include Authority::Abilities

  # Mock a has_many relationship with Mongoid models
  def det_group_metrics
    DetGroupMetric.where(det_group_id: self.id)
  end

  def summary_metrics
    SummaryMetric.where(det_group_id: self.id)
  end

  belongs_to :client, touch: true
  has_many :det_group_detectables, dependent: :destroy
  has_many :detectables, through: :det_group_detectables
	accepts_nested_attributes_for :det_group_detectables, allow_destroy: true
end
