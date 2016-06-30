class EventDetection
  include Mongoid::Document
  include Mongoid::Timestamps

  field :kev, as: :kheer_event_id, type: Integer
  field :kcl, as: :kheer_clip_id, type: Integer
  field :n, as: :name, type: String
  field :w, as: :weight, type: Float

  # millisecond - start of stream/clip is 0
  field :sft, as: :stream_frame_time, type: Integer
  field :cft, as: :clip_frame_time, type: Integer

  # index needed because of sorting
  index({ stream_frame_time: 1 }, { background: true })

  belongs_to :stream_detection, index: true
end
