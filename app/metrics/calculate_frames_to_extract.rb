module Metrics
	class CalculateFramesToExtract
		def initialize(configReader, detectableIds, detectionFrameRate)
			@configReader = configReader
			@detectableIds = detectableIds
			@numFrameIntervalPerFrameSaved = @configReader.dm_ef_num_of_seconds * detectionFrameRate
			@extractVisualSaliencyThresh = 0

			@framesToExtract = []
			@frameTrackers = {}
			@detectableIds.each do |detectableId|
				reset(detectableId)
			end
		end

		def getFramesToExtract
			@framesToExtract.uniq!
			@framesToExtract.sort!
		end

		def addDetectableMetric(frameNumber, detectableId, singleDetectableMetric)
			if @frameTrackers[detectableId][:counter] < @numFrameIntervalPerFrameSaved
				# get max visual saliency score
				score = singleDetectableMetric[:vs]
				if score > @frameTrackers[detectableId][:maxScore]
					@frameTrackers[detectableId][:maxScore] = score
					@frameTrackers[detectableId][:maxScoreFn] = frameNumber
				end
			else
				# if present, add to extraction list
				if @frameTrackers[detectableId][:maxScore] > @extractVisualSaliencyThresh
					@framesToExtract << @frameTrackers[detectableId][:maxScoreFn]
				end
				# and reset
				reset(detectableId)
			end
			# increase counter
			@frameTrackers[detectableId][:counter] += 1
		end

		def reset(detectableId)
			@frameTrackers[detectableId] = { counter: 0, maxScore: -1.0, maxScoreFn: -1 }
		end

	end
end