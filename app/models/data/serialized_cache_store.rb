class SerializedCacheStore
	include Mongoid::Document
	include Mongoid::Timestamps

	# NOTE: this is a capped collection 
	# with max size of 16GB - ensure that existing cachekey
	# is INVALID if any of either det_group or game is `touched`

	# creation: in mongo command line console:
	# db.createCollection("serialized_cache_store", { capped : true, size : 8589934592 })

	field :cachekey, type: String
	field :game_ids, type: Array
	field :det_group_ids, type: Array
	field :summary_resolutions, type: Array
	field :data, type: String
end
