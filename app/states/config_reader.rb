module States
	class ConfigReader
		def initialize
			init_general_config()
			init_detectable_metrics_config()
			init_det_group_metrics_config()
		end

		attr_accessor :g_mongoBatchInsertSize
		attr_accessor :g_videoImportLocalizationPath, :g_videoImportLocalizationFileName
		attr_accessor :g_videoImportLocalizationImages

		def init_general_config
			# mongo write size
			@g_mongoBatchInsertSize = 1000

			# video import saving
			@g_videoImportLocalizationPath = '/sftp/sftpuser/uploads'
			@g_videoImportLocalizationFileName = 'localizations.json'
			@g_videoImportLocalizationImages = 'images'
		end


		attr_accessor :dm_es_maxTimeSeconds, :dm_es_timeDecayWeight
		attr_accessor :dm_sw_size, :dm_sw_decayValues
		attr_accessor :dm_qd_numCols, :dm_qd_numRows

		def init_detectable_metrics_config
			# event score
			@dm_es_maxTimeSeconds = 5
			@dm_es_timeDecayWeight = [0.05, 0.1, 0.15, 0.2, 0.3]

			# sliding window
			@dm_sw_size = 5
			@dm_sw_decayValues = [0.05, 0.05, 0.1, 0.3, 0.5]

			# quadrants in frame
			@dm_qd_numCols = 3
			@dm_qd_numRows = 3
		end


		attr_accessor :dgm_sw_size, :dgm_sw_decayValues
		attr_accessor :dgm_cw_spatialDetGroupCrowding, :dgm_cw_temporalDetGroupCrowding
		attr_accessor :dgm_be_detGroupCrowding, :dgm_be_visualSaliency
		attr_accessor :dgm_be_timingEffectiveness, :dgm_be_spatialEffectiveness

		def init_det_group_metrics_config
			# sliding window
			@dgm_sw_size = 5
			@dgm_sw_decayValues = [0.05, 0.05, 0.1, 0.3, 0.5]

			# crowding weights
			@dgm_cw_spatialDetGroupCrowding = 0.75
			@dgm_cw_temporalDetGroupCrowding = 0.25

			# brand effectiveness weights
			@dgm_be_detGroupCrowding = 0.25
			@dgm_be_visualSaliency = 0.25
			@dgm_be_timingEffectiveness = 0.25
			@dgm_be_spatialEffectiveness = 0.25
		end

	end
end