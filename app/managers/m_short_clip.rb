require 'fileutils'

module Managers
  class MShortClip
    def initialize(shortClip)
      @shortClip = shortClip
      @duration = 6.0 # seconds
      cr = States::ConfigReader.new
      @videoBaseBath = "#{cr.g_videoImportLocalizationPath}"
      @videoFolderName = "#{cr.g_videoFolder}"
      @shortClipFolder = "#{@videoBaseBath}/#{@shortClip.video_id}/#{cr.g_shortClipFolder}"
      FileUtils.mkdir_p(@shortClipFolder)
      @shortClipPath = "#{@shortClipFolder}/#{@shortClip.id}.mp4"
    end

    def create_file_if_needed(videoFrameList)
      return if @shortClip.is_created
      if @shortClip.is_multi_clip
        create_multi_clip(videoFrameList)
      else
        create_single_clip(videoFrameList[0][0], videoFrameList[0][2])
      end
    end

    def create_single_clip(videoId, frameTime)
      startTime = (frameTime / 1000.0) - @duration/2
      startTime = 0 if startTime < @duration
      videoFilePath = "#{@videoBaseBath}/#{videoId}/#{@videoFolderName}/#{videoId}.mp4"
      cmd = "ffmpeg -ss #{startTime} -i #{videoFilePath} -t #{@duration} -reset_timestamps 1 -c copy #{@shortClipPath}"
      self.run_cmd(cmd)
    end

    def create_multi_clip(videoFrameList)
      fullCmd = ""
      intermediateFiles = []
      videoFrameList.each_with_index do |vfl, idx|
        videoId, _, frameTime = vfl[0], vfl[1], vfl[2]
        startTime = (frameTime / 1000.0) - @duration/2
        startTime = 0 if startTime < @duration
        videoFilePath = "#{@videoBaseBath}/#{videoId}/#{@videoFolderName}/#{videoId}.mp4"
        inmF = "#{@shortClipFolder}/#{videoId}_intermediate_#{idx}.ts"
        intermediateFiles << inmF
        fullCmd += "ffmpeg -ss #{startTime} -i #{videoFilePath} -t #{@duration} -c copy -bsf:v h264_mp4toannexb -f mpegts #{inmF} && "
      end
      concatCmd = 'ffmpeg -i "concat:'
      intermediateFiles.each do |inmF|
        concatCmd = concatCmd + inmF + '|'
      end
      fullCmd += concatCmd.chomp('|')
      fullCmd += '" -c copy -bsf:a aac_adtstoasc '
      fullCmd += "#{@shortClipPath}"
      self.run_cmd(fullCmd)

      intermediateFiles.each do |inmF|
        FileUtils.rm_rf(inmF)
      end
    end

    def run_cmd(cmd)
      system(cmd)
      @shortClip.update(is_created: true)
    end

    def delete_file
      FileUtils.rm_rf(@shortClipPath)
    end
  end
end
