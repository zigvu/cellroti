require 'yaml'

module States
  class ConfigReader
    def initialize
      @general = YAML.load_file("#{Rails.root}/config/metrics/general.yml")
      @default = YAML.load_file("#{Rails.root}/config/metrics/soccer.yml")

      init_general_config()
      init_detectable_metrics_config()
      init_det_group_metrics_config()
    end

    attr_accessor :g_mongoBatchInsertSize
    attr_accessor :g_videoImportLocalizationPath
    attr_accessor :g_videoImportLocalizationImages, :g_videoImportLocalizationThumbnails

    def init_general_config
      # mongo write size
      @g_mongoBatchInsertSize = @general["mongo_batch_insert_size"]

      # video import saving
      @g_videoImportLocalizationPath = @general["video_localization_path"]
      # not currently used:
      @g_videoImportLocalizationImages = @general["localization_image_folder"]
      @g_videoImportLocalizationThumbnails = @general["localization_thumbnail_folder"]
    end

    attr_accessor :dm_dgc_sw_size, :dm_dgc_sw_decayWeights
    attr_accessor :dm_vs_sw_size, :dm_vs_sw_decayWeights
    attr_accessor :dm_te_sw_size, :dm_te_sw_decayWeights
    attr_accessor :dm_se_sw_size, :dm_se_sw_decayWeights
    attr_accessor :dm_qd_numCols, :dm_qd_numRows
    attr_accessor :dm_qd_centerWeight, :dm_qd_cornerWeight, :dm_qd_nonCornerEdgeWeight
    attr_accessor :dm_fe_smallest_time_window, :dm_fe_largest_time_window

    def init_detectable_metrics_config
      dm_default = @default["detectable_metrics"]

      # det group crowding
      dm_dgc = dm_default["det_group_crowding"]
      @dm_dgc_sw_size = dm_dgc["sliding_window"]["size_in_seconds"]
      @dm_dgc_sw_decayWeights = dm_dgc["sliding_window"]["decay_weights"]

      # visual saliency
      dm_vs = dm_default["visual_saliency"]
      @dm_vs_sw_size = dm_vs["sliding_window"]["size_in_seconds"]
      @dm_vs_sw_decayWeights = dm_vs["sliding_window"]["decay_weights"]

      # timing effectiveness
      dm_te = dm_default["timing_effectiveness"]
      @dm_te_sw_size = dm_te["sliding_window"]["size_in_seconds"]
      @dm_te_sw_decayWeights = dm_te["sliding_window"]["decay_weights"]

      # spatial effectiveness
      dm_se = dm_default["spatial_effectiveness"]
      @dm_se_sw_size = dm_se["sliding_window"]["size_in_seconds"]
      @dm_se_sw_decayWeights = dm_se["sliding_window"]["decay_weights"]

      # quadrants in frame
      @dm_qd_numCols = dm_se["quadrants_num_cols"]
      @dm_qd_numRows = dm_se["quadrants_num_rows"]
      @dm_qd_centerWeight  = dm_se["quadrants_center_weight"]
      @dm_qd_cornerWeight  = dm_se["quadrants_corner_weight"]
      @dm_qd_nonCornerEdgeWeight  = dm_se["quadrants_non_corner_edge_weight"]

      # frame extraction
      dm_fe = dm_default["frame_extraction"]
      @dm_fe_smallest_time_window = dm_fe["smallest_time_window"]
      @dm_fe_largest_time_window = dm_fe["largest_time_window"]
    end

    attr_accessor :dgm_be_detGroupCrowding, :dgm_be_visualSaliency
    attr_accessor :dgm_be_timingEffectiveness, :dgm_be_spatialEffectiveness

    def init_det_group_metrics_config
      dgm_default = @default["det_group_metrics"]

      # brand effectiveness weights
      @dgm_be_detGroupCrowding = dgm_default["be_det_group_crowding"]
      @dgm_be_visualSaliency = dgm_default["be_visual_saliency"]
      @dgm_be_timingEffectiveness = dgm_default["be_timing_effectiveness"]
      @dgm_be_spatialEffectiveness = dgm_default["be_spatial_effectiveness"]
    end

    # currently, we get time stamp in millisecond resolution
    def self.frameTimeStampResolution
      return 1000.0
    end

  end
end
