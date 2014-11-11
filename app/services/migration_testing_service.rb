require 'json'

module Services
	class MigrationTestingService

		def test_analytics_game_data(game, client)
			summaryResolution = States::SummaryResolutions.gameResolution
			summaryTableName = States::SummaryResolutions.new.resolutions[summaryResolution][:tname]
			detGroupIds = client.det_groups.pluck(:id)

			mongoData = Jsonifiers::JAnalyticsGameData.getGameSummaryData(
				game, summaryResolution, detGroupIds)
			sqlData = Jsonifiers::JAnalyticsGameData.getGameSummaryData2(
				game, summaryTableName, detGroupIds)

			sqlData.each_with_index do |sd, idx|
				time = sd[:time]
				sqlBgData = sd[:bgData]
				mongoBgData = mongoData[idx][:bgData]
				sqlBgData.each_with_index do |sdValue, sdIdx|
					mdValue = mongoBgData[sdIdx]
					sdValue.each do |sdk, sdv|
						mdv = mdValue[sdk]
						sdv.each_with_index do |sdkD, sdkIdx|
							mdkD = mdv[sdkIdx]
							if sdkD.class != Array
								if not (teq(sdkD.to_f, mdkD.to_f))
									raise "JAnalyticsGameData don't match for game #{game.id}, item #{idx}, det_group #{sdk}"
								end
							end
						end
					end
				end
			end

			return true
		end

		def test_database_creation(video)
			test_chia_input(video)
			test_raw_detectable_metrics(video)
			test_det_group_metrics(video)
			test_summary_metrics(video)
		end

		def test_summary_metrics(video)
			resolutions = States::SummaryResolutions.new.resolutions
			mongDetGroupIds = video.summary_metrics.pluck(:det_group_id).uniq
			mongDetGroupIds.each do |dgId|
				resolutions.each do |t, res|
					mongoMetrics = video.summary_metrics.where(det_group_id: dgId, resolution_seconds: t).first
					video.send(res[:tname]).where(det_group_id: dgId).each do |sqlSM|
						mongoSM = mongoMetrics.single_summary_metrics.where(frame_time: sqlSM.frame_time).first
						if mongoSM == nil
							raise "Mongo does not have an entry for #{res[:tname]} and time #{sqlSM.frame_time}"
						end
						# should be same as in mongo
						if not (teq(mongoSM.brand_effectiveness, sqlSM.brand_effectiveness) and 
							teq(mongoSM.det_group_crowding, sqlSM.det_group_crowding) and 
							teq(mongoSM.visual_saliency, sqlSM.visual_saliency) and 
							teq(mongoSM.timing_effectiveness, sqlSM.timing_effectiveness) and 
							teq(mongoSM.spatial_effectiveness, sqlSM.spatial_effectiveness) and 
							teq(mongoSM.detections_count, sqlSM.detections_count))	
							raise "Mongo has different score for #{res[:tname]}, time #{sqlSM.frame_time} & dgId #{dgId}"
						end
					end
				end
			end
			return true
		end

		def test_det_group_metrics(video)
			mongDetGroupIds = video.det_group_metrics.pluck(:det_group_id)
			mongDetGroupIds.each do |dgId|
				mongoMetrics = video.det_group_metrics.where(det_group_id: dgId).first
				video.video_frames.each do |vf|
					sm = mongoMetrics.single_det_group_metrics.where(frame_number: vf.frame_number).first
					if sm == nil
						raise "Mongo does not have an entry for frame num #{vf.frame_number} and det group #{dgId}"
					end
					dgm = vf.det_group_video_frames.where(det_group_id: dgId).first
					if dgm == nil
						raise "SQL does not have an entry for frame num #{vf.frame_number} and det group #{dgId}"
					end
					# should be same as in mongo
					if not (teq(dgm.brand_effectiveness, sm.brand_effectiveness) and 
						teq(dgm.det_group_crowding, sm.det_group_crowding) and 
						teq(dgm.visual_saliency, sm.visual_saliency) and 
						teq(dgm.timing_effectiveness, sm.timing_effectiveness) and 
						teq(dgm.spatial_effectiveness, sm.spatial_effectiveness) and 
						teq(dgm.detections_count, sm.detections_count))	
						raise "Mongo has different score for frame num #{vf.frame_number} and det group #{dgId}"
					end
				end
			end
			return true
		end

		def test_raw_detectable_metrics(video)
			mongoDetectableIds = video.video_detections.first.detectable_ids
			mongoMetrics = video.detectable_metrics.first
			video.video_frames.each do |vf|
				vf.raw_detectables.each do |rw|
					sm = mongoMetrics.single_detectable_metrics
						.where(frame_number: vf.frame_number, detectable_id: rw.detectable_id).first
					if not mongoDetectableIds.include?(rw.detectable_id)
						# don't expect to see in mongo
						if sm != nil
							raise "Mongo has an entry for frame num #{vf.frame_number} and detectableId #{rw.detectable_id}"
						end
					else
						if sm == nil
							raise "Mongo does not have an entry for frame num #{vf.frame_number} and detectableId #{rw.detectable_id}"
						end
						# should be same as in mongo
						if not (teq(rw.spatial_effectiveness, sm.spatial_effectiveness) and 
							teq(rw.visual_saliency, sm.visual_saliency) and 
							teq(rw.detections_count, sm.detections_count) and 
							teq(rw.cumulative_area, sm.cumulative_area) and 
							teq(rw.event_score, sm.event_score))
							raise "Mongo has different score for frame num #{vf.frame_number} and detectableId #{rw.detectable_id}"							
						end
					end
				end
			end
			return true
		end

		def test_chia_input(video)
			mongoVideoDetections = video.video_detections.first.detections
			mongoVideoDetections.each do |frameNum, dets|
				dets.each do |detectableId, mongoDetections|
					sqlDetections = VideoFrame
						.where(frame_number: frameNum).first
						.detections.where(detectable_id: detectableId.to_i)

					if mongoDetections.count != sqlDetections.count
						raise "Different counts for frame num #{frameNum}"
					end

					sqlDetections.each do |sqlDetection|
						foundMatch = false
						mongoDetections.each do |mongoDetection|
							if teq(mongoDetection[:score], sqlDetection.score)
								foundMatch = true
								break
							end
						end
						if not foundMatch
							raise "Matching score not found: frame num #{frameNum}, sqlDetection: #{sqlDetection.id}"
						end
					end
				end
			end
			return true
		end

		# test for equality with some decimal percision
		def teq(num1, num2, decimalPrecision = 3)
			precision = 10.0**(-1 * decimalPrecision)
			return ((num1.round(4) - num2.round(4)).abs < 0.001)
		end

	end
end