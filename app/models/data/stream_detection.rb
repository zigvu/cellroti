class StreamDetection
  include Mongoid::Document
  include Mongoid::Timestamps

  field :bd, as: :begin_date, type: DateTime
  field :ed, as: :end_date, type: DateTime

  field :prr, as: :playback_frame_rate, type: Integer
  field :dfr, as: :detection_frame_rate, type: Integer
  field :w, as: :width, type: Integer
  field :h, as: :height, type: Integer
  field :dis, as: :detectable_ids, type: Array

  # index needed because of sorting
  index({ begin_date: 1 }, { background: true })

  has_many :event_detections, dependent: :destroy, autosave: true, :order => :stream_frame_time.asc
  has_many :frame_detections, dependent: :destroy, autosave: true, :order => :stream_frame_time.asc
  has_many :summary_metrics, dependent: :destroy, autosave: true, :order => :begin_date.asc
  belongs_to :stream, index: true
end
