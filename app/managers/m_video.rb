require 'fileutils'

module Managers
	class MVideo
		def initialize(video)
			@video = video
			configReader = States::ConfigReader.new
			@localizationPath = configReader.g_videoImportLocalizationPath
		end

		def get_localization_folder
			localizationFolder = "#{@localizationPath}/#{@video.id}"
			FileUtils.mkdir_p(localizationFolder)
			localizationFolder
		end

		def get_gzip_extracted_frames_file
			FileUtils.rm_rf("#{get_localization_folder}/extracted_frames.tar.gz")
			FileUtils.rm_rf("#{get_localization_folder}/frames")
			FileUtils.rm_rf("#{get_localization_folder}/thumbnails")
			"#{get_localization_folder}/extracted_frames.tar.gz"
		end

		def get_video_meta_data_file
			"#{get_localization_folder}/video_meta_data.json"
		end

		def get_detectable_ids_file
			"#{get_localization_folder}/detectable_ids.json"
		end

		def get_events_file
			"#{get_localization_folder}/events.json"
		end

		def get_localization_file
			"#{get_localization_folder}/localization.json"
		end

		def delete_localization_folder
			FileUtils.rm_rf(get_localization_folder)
		end
	end
end