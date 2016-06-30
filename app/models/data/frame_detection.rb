class FrameDetection
  include Mongoid::Document

  field :kcl, as: :kheer_clip_id, type: Integer
  field :kca, as: :kheer_capture_id, type: Integer

  # millisecond - start of stream/clip is 0
  field :sft, as: :stream_frame_time, type: Integer
  field :cft, as: :clip_frame_time, type: Integer

  embeds_many :single_detectable_metrics

  # no index needed since all access sequential and through stream_detection

  belongs_to :stream_detection, index: true
end
