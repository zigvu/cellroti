module Managers
	class MVideo
		def initialize(video)
			@video = video
		end

		def get_localization_file
      configReader = States::ConfigReader.new
      localizationPath = configReader.g_videoImportLocalizationPath
      localizationFileName = configReader.g_videoImportLocalizationFileName
      localizationFile = "#{localizationPath}/#{@video.id}/#{localizationFileName}"
      return localizationFile
		end

	end
end