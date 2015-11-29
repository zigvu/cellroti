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
			largestDetMet = singleDetectableMetrics.sort{ |s| s[:vs] }.last
			# if singleDetectableMetrics has no detections
			score = largestDetMet == nil ? 0 : largestDetMet[:vs]

			@smallestTimeWindowFrames << { fn: frameNumber, score: score }
			@largestTimeWindowFrames << { fn: frameNumber, score: score }

			# if smallest time window is full, add to frames to extract and reset
			if @smallestTimeWindowFrames.count >= @numFramesSmallestTimeWindow
				frameToExtract = @smallestTimeWindowFrames.sort{ |v| v[:score] }.last
				if frameToExtract[:score] > @extractVisualSaliencyThresh
					@framesToExtract << frameToExtract[:fn]
					# since a frame has gone in in this small window, we don't need to put
					# it in large window, so need to reset that
					reset(@largestTimeWindowFrames)
				end
				reset(@smallestTimeWindowFrames)
			end
			# if largest time window is full, reset
			if @largestTimeWindowFrames.count >= @numFramesLargestTimeWindow
				frameToExtract = @largestTimeWindowFrames.sort{ |v| v[:score] }.last
				# even if the score is less than extractVisualSaliencyThresh, we want to
				# get at least one frame
				@framesToExtract << frameToExtract[:fn]
				reset(@largestTimeWindowFrames)
			end
		end

		def reset(arr)
			arr = []
		end

	end
end