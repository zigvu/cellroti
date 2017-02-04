require 'fileutils'

module Managers
  class MShortClip
    def initialize(shortClip)
      @shortClip = shortClip
      cr = States::ConfigReader.new
      vId = @shortClip.video_id
      @videoFilePath = "#{cr.g_videoImportLocalizationPath}/#{vId}/#{cr.g_videoFolder}/#{vId}.mp4"
      scf = "#{cr.g_videoImportLocalizationPath}/#{vId}/#{cr.g_shortClipFolder}"
      FileUtils.mkdir_p(scf)
      @shortClipPath = "#{scf}/#{@shortClip.id}.mp4"
    end

    def create_file
      # before and after 3 seconds
      startTime = (@shortClip.frame_time / 1000.0) - 3.0
      duration = 6 # seconds
      cmd = "ffmpeg -ss #{startTime} -i #{@videoFilePath} -t #{duration} -reset_timestamps 1 -c copy #{@shortClipPath}"
      system(cmd)
      @shortClip.update(is_created: true)
    end

    def delete_file
      FileUtils.rm_rf(@shortClipPath)
    end
  end
end
