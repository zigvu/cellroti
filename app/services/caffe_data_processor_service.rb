require 'json'

module Services
	class CaffeDataProcessorService
		def initialize
		end

		def populate(video, caffeDataFile)
			caffe_data = JSON.parse(File.read(caffeDataFile))
			raise "Input data not proper JSON" if caffe_data.class != Hash
			raise "Wrong video data file" if caffe_data['video_id'].to_i != video.id

			update_video(video, caffe_data['video_attributes'])
			write_detections(video, caffe_data['detections'])
		end

		def update_video(video, videoAttributes)
			raise "Attributes data not proper JSON" if videoAttributes.class != Hash
			video.update(
				quality: videoAttributes['quality'],
				format: videoAttributes['format'],
				length: videoAttributes['length'].to_i,
				width: videoAttributes['width'].to_i,
				height: videoAttributes['height'].to_i,
				detection_frame_rate: videoAttributes['detection_frame_rate'].to_f,
				playback_frame_rate: videoAttributes['playback_frame_rate'].to_f)
		end

		# write data to database
		def write_detections(video, detectionsData)
			raise "Detections data not proper JSON" if detectionsData.class != Hash
			sanitizedDetectionsData, allDetectableIds = sanitize_detections_data(detectionsData)

			# find det groups which will be filled by given data
			detGroupIds = find_det_group_ids(allDetectableIds)
			raise "No det group can be constructed from detectables in video" if detGroupIds.count == 0
			

			# if data for this video already exists, purge
			# all old data
			if video.video_detections.first != nil
				video.video_detections.each do |vd|
					vd.destroy
				end
				video.detectable_metrics.each do |dm|
					dm.destroy
				end
				video.det_group_metrics.each do |dgm|
					dgm.destroy
				end
				video.summary_metrics.each do |sm|
					sm.destroy
				end
			end

			# store raw detections from chia
			VideoDetection.create(
				video_id: video.id,
				detections: sanitizedDetectionsData,
				detectable_ids: allDetectableIds)

			# calculate frame level detection metrics for each detectable
			Metrics::CalculateDetectableMetrics.new(video).calculate

			# aggregate detection metrics into det_group_metrics
			Metrics::CalculateDetGroupMetrics.new(video, detGroupIds).calculate
			
			# aggregate det_group_metrics into summary_metrics
			Metrics::CalculateSummaryMetrics.new(video, detGroupIds).calculate

			return true
		end

		# sanitize data - convert string to numbers
		def sanitize_detections_data(detectionsData)
			sanitizedDetectionsData = {}
			allDetectableIds = []
			sortedFrameNums = detectionsData.keys.collect{|i| i.to_i}.sort
			sortedFrameNums.each do |frameNum|
				sanitizedDetectionsData[frameNum.to_s] = {}
				detectionsData[frameNum.to_s].each do |detectableId, detections|
					allDetectableIds << detectableId.to_i
					sanitizedDetectionsData[frameNum.to_s][detectableId.to_s] = []
					detections.each do |detection|
						sanitizedDetectionsData[frameNum.to_s][detectableId.to_s] << {
							score: detection["score"].to_f,
							bbox: {
								x: detection["bbox"]["x"].to_i,
								y: detection["bbox"]["y"].to_i,
								width: detection["bbox"]["width"].to_i,
								height: detection["bbox"]["height"].to_i
							}
						}
					end
				end
				allDetectableIds.uniq!
			end
			return sanitizedDetectionsData, allDetectableIds.sort!
		end

		# find all det groups that can be constructed from a set of detectable Ids
		def find_det_group_ids(allDetectableIds)
			detGroupIds = []
			DetGroup.all.each do |dg|
				detGroupIncluded = true
				dg.detectables.pluck(:id).each do |dId|
					detGroupIncluded = false if not allDetectableIds.include?(dId)
				end
				detGroupIds << dg.id if detGroupIncluded
			end
			return detGroupIds
		end

	end
end