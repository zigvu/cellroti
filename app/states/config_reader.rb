require 'yaml'

module States
	class ConfigReader
		def initialize
			# @default = YAML.load_file("#{Rails.root}/config/metrics/default.yml")
			@default = YAML.load_file("#{Rails.root}/config/metrics/first_try.yml")

			init_general_config()
			init_detectable_metrics_config()
			init_det_group_metrics_config()
		end

		attr_accessor :g_mongoBatchInsertSize
		attr_accessor :g_videoImportLocalizationPath, :g_videoImportLocalizationFileName
		attr_accessor :g_videoImportLocalizationImages

		def init_general_config
			g_default = @default["general"]
			# mongo write size
			@g_mongoBatchInsertSize = g_default["mongo_batch_insert_size"]

			# video import saving
			@g_videoImportLocalizationPath = g_default["video_localization_path"]
			@g_videoImportLocalizationFileName = g_default["localization_filename"]
			@g_videoImportLocalizationImages = g_default["localization_image_folder"]
			@g_videoImportLocalizationThumbnails = g_default["localization_thumbnail_folder"]
		end


		attr_accessor :dm_es_maxTimeSeconds, :dm_es_timeDecayWeights
		attr_accessor :dm_sw_size_seconds_scores, :dm_sw_decayWeights_scores
		attr_accessor :dm_qd_numCols, :dm_qd_numRows
		attr_accessor :dm_qd_centerWeight, :dm_qd_cornerWeight, :dm_qd_nonCornerEdgeWeight

		def init_detectable_metrics_config
			dm_default = @default["detectable_metrics"]

			# event score
			@dm_es_maxTimeSeconds = dm_default["event_score_time_decay_seconds"]
			@dm_es_timeDecayWeights = dm_default["event_score_time_decay_weights"]

			# sliding window - scores
			@dm_sw_size_seconds_scores = dm_default["sliding_window_size_seconds_scores"]
			@dm_sw_decayWeights_scores = dm_default["sliding_window_decay_weights_scores"]

			# quadrants in frame
			@dm_qd_numCols = dm_default["quadrants_num_cols"]
			@dm_qd_numRows = dm_default["quadrants_num_rows"]
			@dm_qd_centerWeight  = dm_default["quadrants_center_weight"]
			@dm_qd_cornerWeight  = dm_default["quadrants_corner_weight"]
			@dm_qd_nonCornerEdgeWeight  = dm_default["quadrants_non_corner_edge_weight"]
		end


		attr_accessor :dgm_sw_size_seconds_temporalCrowding, :dgm_sw_decayWeights_temporalCrowding
		attr_accessor :dgm_cw_spatialDetGroupCrowding, :dgm_cw_temporalDetGroupCrowding
		attr_accessor :dgm_be_detGroupCrowding, :dgm_be_visualSaliency
		attr_accessor :dgm_be_timingEffectiveness, :dgm_be_spatialEffectiveness

		def init_det_group_metrics_config
			dgm_default = @default["det_group_metrics"]

			# sliding window - temporal crowding
			@dgm_sw_size_seconds_temporalCrowding = dgm_default["sliding_window_size_seconds_temporal_crowding"]
			@dgm_sw_decayWeights_temporalCrowding = dgm_default["sliding_window_decay_weights_temporal_crowding"]

			# crowding weights
			@dgm_cw_spatialDetGroupCrowding = dgm_default["spatial_crowding_weight"]
			@dgm_cw_temporalDetGroupCrowding = dgm_default["temporal_crowding_weight"]

			# brand effectiveness weights
			@dgm_be_detGroupCrowding = dgm_default["be_det_group_crowding"]
			@dgm_be_visualSaliency = dgm_default["be_visual_saliency"]
			@dgm_be_timingEffectiveness = dgm_default["be_timing_effectiveness"]
			@dgm_be_spatialEffectiveness = dgm_default["be_spatial_effectiveness"]
		end

	end
end