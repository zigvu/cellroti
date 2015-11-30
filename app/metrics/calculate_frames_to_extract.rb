module Metrics
	class CalculateFramesToExtract
		def initialize(configReader, detectionFrameRate)
			@configReader = configReader

			@numFramesSmallestTimeWindow = @configReader.dm_fe_smallest_time_window * detectionFrameRate
			@numFramesLargestTimeWindow = @configReader.dm_fe_largest_time_window * detectionFrameRate

			@extractVisualSaliencyThresh = 0

			@framesToExtract = []

			# format:
			# [{fn: , score: }, ]
			@smallestTimeWindowFrames = []
			@largestTimeWindowFrames = []
		end

		def getFramesToExtract
			@framesToExtract.uniq!
			@framesToExtract.sort!
		end

		def addDetectableMetrics(frameNumber, singleDetectableMetrics)
			# get largest score detectble metrics
			highestDetMet = singleDetectableMetrics.sort{ |s| s[:ps] }.last
			# if singleDetectableMetrics has no detections
			score = highestDetMet == nil ? 0 : highestDetMet[:ps]

			@smallestTimeWindowFrames << { fn: frameNumber, score: score }
			@largestTimeWindowFrames << { fn: frameNumber, score: score }

			# if smallest time window is full, add to frames to extract and reset
			if @smallestTimeWindowFrames.count >= @numFramesSmallestTimeWindow
				frameToExtract = @smallestTimeWindowFrames.sort{ |v| v[:score] }.last
				if frameToExtract[:score] > @extractVisualSaliencyThresh
					@framesToExtract << frameToExtract[:fn]
					# since a frame has gone in in this small window, we don't need to put
					# it in large window, so need to reset that
					@largestTimeWindowFrames = []
				end
				@smallestTimeWindowFrames = []
			end
			# if largest time window is full, reset
			if @largestTimeWindowFrames.count >= @numFramesLargestTimeWindow
				frameToExtract = @largestTimeWindowFrames.sort{ |v| v[:score] }.last
				# even if the score is less than extractVisualSaliencyThresh, we want to
				# get at least one frame
				@framesToExtract << frameToExtract[:fn]
				@largestTimeWindowFrames = []
			end
		end

	end
end