class Stream
  include Mongoid::Document
  include Mongoid::Timestamps

  field :ksd, as: :kheer_stream_id, type: Integer
  field :nm, as: :name, type: String

  has_many :summary_metrics, dependent: :destroy, autosave: true, :order => :begin_date.asc
  has_many :stream_detections, dependent: :destroy, autosave: true, :order => :begin_date.asc
end
