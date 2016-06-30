class SummaryMetric
  include Mongoid::Document

  field :dgi, as: :det_group_id, type: Integer
  # format
  # {clips: [{kheer_clip_id:, brand_effectiveness:, clip_frame_time:}, ]}
  field :hc, as: :highest_clips, type: Hash

  field :bd, as: :begin_date, type: DateTime
  field :db, as: :date_bundle, type: Integer

  index({ stream_id: 1, det_group_id: 1, begin_date: 1, date_bundle: 1 }, { background: true })

  has_many :single_summary_metrics, dependent: :destroy, autosave: true, :order => :frame_time.asc
  belongs_to :stream, index: true
  belongs_to :stream_detection, index: true
end
