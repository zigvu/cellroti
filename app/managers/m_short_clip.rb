require 'fileutils'

module Managers
  class MShortClip
    def initialize(shortClip)
      @shortClip = shortClip
      configReader = States::ConfigReader.new
      @videoFilePath = "#{configReader.g_videoFilePath}/#{@shortClip.video_id}.mp4"
      @shortClipPath = "#{configReader.g_shortClipPath}/#{@shortClip.id}.mp4"
    end

    def create_file
      puts "******************* Create from " + @videoFilePath + " ******************* "
    end

    def delete_file
      puts "******************* Deleted " + @shortClipPath + " clip ******************* "
      FileUtils.rm_rf(@shortClipPath)
    end
  end
end
