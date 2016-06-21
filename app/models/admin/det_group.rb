class DetGroup < ActiveRecord::Base
  # For authority
  include Authority::Abilities

  validates :name, presence: true, uniqueness: true
  before_destroy :destroy_mongo_documents, prepend: true

  # simulate released det groups
  def self.released_det_groups
    cs = Client.zigvu_client.settings
    nonReleasedDGId = [
      [cs.getJobsDgQueue] +
      [cs.getJobsDgWorking] +
      [cs.getJobsDgFail] +
      [cs.getJobsDgReview]].flatten.uniq
    allDGId = DetGroup.all.pluck(:id)
    return DetGroup.where(id: (allDGId - nonReleasedDGId))
  end

  # Mock a has_many relationship with Mongoid models
  def summary_metrics
    SummaryMetric.where(det_group_id: self.id)
  end

  has_many :det_group_clients, dependent: :destroy
  has_many :clients, through: :det_group_clients

  has_many :det_group_detectables, dependent: :destroy
  has_many :detectables, through: :det_group_detectables
  accepts_nested_attributes_for :det_group_detectables, allow_destroy: true

  private
    def destroy_mongo_documents
      SummaryMetric.destroy_all(det_group_id: self.id)
    end
end
