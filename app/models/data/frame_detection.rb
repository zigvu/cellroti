class FrameDetection
  include Mongoid::Document

  field :fn, as: :frame_number, type: Integer
  field :ft, as: :frame_time, type: Integer

  embeds_many :single_detectable_metrics

  # index for faster traversal during ordering
  index({ frame_number: 1 }, { background: true })

  belongs_to :video_detection, index: true
end
