require 'json'

module SeedHelpers
	class VideoDataWriter
		def initialize(caffeDataReferenceFile, seededRandom)
			@rawData = JSON.parse(File.read(caffeDataReferenceFile))

			@tempFolder = '/mnt/tmp'
			@rnd = seededRandom || Random.new(1234567890)
		end

		def generateAndSave(videoId, lengthMS, structureType)
			videoAttributes, videoData = generate(lengthMS, structureType)

			saveData = {
				video_id: videoId,
				video_attributes: videoAttributes,
				detections: videoData
			}
			
			video = Video.find(videoId)
			tempFile = "#{@tempFolder}/videoTempJSON_#{video.id}.json"
			File.open(tempFile, "w") do |f|
				f.write(JSON.pretty_generate(saveData))
			end

			# populate data
			mvdi = Metrics::VideoDataImport.new()
			mvdi.populate(video, tempFile)
			File.delete(tempFile) if File.exist?(tempFile)

			clearCaches()
		end

		def clearCaches
			Rails.cache.clear
			SerializedCacheStore.all.each do |scs|
				scs.destroy
			end
		end


		def generate(lengthMS, structureType)
			videoAttributes = @rawData["video_attributes"]
			frameStep = videoAttributes["detection_frame_rate"]
			avgFrameRate = videoAttributes["playback_frame_rate"]
			videoAttributes["length"] = lengthMS
			
			numOfFrames = (((lengthMS/1000) * avgFrameRate).to_i / frameStep).to_i

			sdg = SeedHelpers::StructuredDataGenerator.new(structureType, numOfFrames, frameStep, @rnd)
			videoData = sdg.generate()

			return videoAttributes, videoData
		end
	end
end