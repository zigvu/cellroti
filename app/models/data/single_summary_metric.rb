class SingleSummaryMetric
  include Mongoid::Document

  field :sft, as: :stream_frame_time, type: Integer
  field :re, as: :resolution, type: Integer

  field :be, as: :brand_effectiveness, type: Float

  field :dgc, as: :det_group_crowding, type: Float
  field :vs, as: :visual_saliency, type: Float
  field :te, as: :timing_effectiveness, type: Float
  field :se, as: :spatial_effectiveness, type: Float

  field :vd, as: :view_duration, type: Float
  field :vp, as: :view_persistence, type: Float

  field :qd, as: :quadrants, type: Hash

  # index needed because of sorting
  index({ stream_frame_time: 1 }, { background: true })

  belongs_to :summary_metric, index: true
end
