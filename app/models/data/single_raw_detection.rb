class SingleRawDetection
	include Mongoid::Document

	field :di, as: :detectable_id, type: Integer
	field :de, as: :detections, type: Hash

	embedded_in :frame_detection
end
