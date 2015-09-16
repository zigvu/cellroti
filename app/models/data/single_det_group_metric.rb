class SingleDetGroupMetric
	# NOTE:
	# This class is only used as a temporary compute storage prior to
	# creating summary metrics. Hence we do not need to save this
	# class in database.

	# However, so that there is no confusion about the fields computed,
	# we are using a class rather than a Hash to store intermediate results

	attr_accessor :frame_number
	attr_accessor :frame_time
	attr_accessor :det_group_id

	attr_accessor :brand_effectiveness

	attr_accessor :det_group_crowding
	attr_accessor :visual_saliency
	attr_accessor :timing_effectiveness
	attr_accessor :spatial_effectiveness

	attr_accessor :view_duration
	attr_accessor :view_persistence

	attr_accessor :quadrants

end
