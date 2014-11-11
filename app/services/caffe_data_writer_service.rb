#TODO: REPLACE

require 'json'

module Services
	class CaffeDataWriterService
		def initialize(video, caffeDataFile)
			@video = video
			allData = JSON.parse(File.read(caffeDataFile))
			@caffe_data = allData["detections"]
		end

		def populate
			sortedFrameNums = @caffe_data.keys.collect{|i| i.to_i}.sort
			fps = @video.playback_frame_rate
			sortedFrameNums.each do |frameNum|
				#puts "Working on frame number: #{frameNum}"
				frameTime = (frameNum * 1000.0 / fps).to_i
				# create video frame and all detections in that frame
				videoFrame = @video.video_frames.create(frame_time: frameTime, frame_number: frameNum)
				@caffe_data[frameNum.to_s].each do |detectableId, detections|
					# there might be multiple detections for the same detectable in the same frame
					detections.each do |detection|
						score = detection["score"].to_f
						bbox_x = detection["bbox"]["x"].to_i
						bbox_y = detection["bbox"]["y"].to_i
						bbox_width = detection["bbox"]["width"].to_i
						bbox_height = detection["bbox"]["height"].to_i
						# add detection
						videoFrame.detections.create(score: score, 
							bbox_x: bbox_x, bbox_y: bbox_y, bbox_width: bbox_width, bbox_height: bbox_height,
							detectable_id: detectableId.to_i)
					end
				end
			end
			return true
		end
	end
end