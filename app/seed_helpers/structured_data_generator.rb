
module SeedHelpers
	class StructuredDataGenerator
		# structure types:
		def self.structureTypes
			[:random, :constant, :sine, :brokenSine]
		end

		def initialize(structureType, numOfFrames, frameStep, seededRandom)
			@structureType = structureType

			@numOfFrames = numOfFrames
			@frameStep = frameStep

			setDetectableIds([2,3,5,6])
			# setDetectableIds([2])
			@rnd = seededRandom || Random.new(1234567890)

			@width = 1280
			@height = 720

			@extractedFrames = []
			@frameExtractionThresh = 0.81
		end

		def setDetectableIds(detectableIds)
			@detectableIds = detectableIds
		end

		def getExtractedFrames
			return @extractedFrames
		end

		def generate
			if @structureType == :random
				return generateRandom()
			elsif @structureType == :sine
				return generateSine()
			elsif @structureType == :brokenSine
				return generateBrokenSine()
			end
		end

		# -----------------------------------------------------
		# BEGIN: broken-sine
		def generateBrokenSine
			@detectableScoreGenerators = {}
			@detectableIds.each_with_index do |dId, idx|
				@detectableScoreGenerators[dId] = SeedHelpers::DetectableScoreGenerator.new(\
					nil, nil, nil, nil, nil)

				# start data generation off-phase
				for i in 0..idx
					@detectableScoreGenerators[dId].updateBrokenSine()
				end
			end

			vd = {}
			counter = 1
			for i in 0..@numOfFrames
				vd.merge!({ counter =>  nextBrokenSineData() })
				addToExtractedFrames(vd[counter], counter)

				counter += @frameStep
			end
			return vd
		end

		def nextBrokenSineData
			data = {}
			@detectableScoreGenerators.each do |dId, sg|
				# if return value is positive, then we write
				if(sg.updateBrokenSine())
					bboxes = [{
							score: sg.score,
							bbox: { x: sg.x, y: sg.y, width: sg.w, height: sg.h }
						}]
					data.merge!({dId => bboxes})
				end
			end
			return data
		end

		# END: broken-sine
		# -----------------------------------------------------

		# -----------------------------------------------------
		# BEGIN: sine
		def generateSine
			@detectableScoreGenerators = {}
			@detectableIds.each_with_index do |dId, idx|
				@detectableScoreGenerators[dId] = SeedHelpers::DetectableScoreGenerator.new(\
					nil, nil, nil, nil, nil)

				# start data generation off-phase
				for i in 0..idx
					@detectableScoreGenerators[dId].updateSine()
				end
			end

			vd = {}
			counter = 1
			for i in 0..@numOfFrames
				vd.merge!({ counter =>  nextSineData() })
				addToExtractedFrames(vd[counter], counter)

				counter += @frameStep
			end
			return vd
		end

		def nextSineData
			data = {}
			@detectableScoreGenerators.each do |dId, sg|
				sg.updateSine()
				bboxes = [{
						score: sg.score,
						bbox: { x: sg.x, y: sg.y, width: sg.w, height: sg.h }
					}]
				data.merge!({dId => bboxes})
			end
			return data
		end

		# END: sine
		# -----------------------------------------------------


		# -----------------------------------------------------
		# BEGIN: random
		def generateRandom
			@detectableScoreGenerators = {}
			@detectableIds.each do |dId|
				@detectableScoreGenerators[dId] = SeedHelpers::DetectableScoreGenerator.new(\
					nil, nil, nil, nil, nil)
			end

			vd = {}
			counter = 1
			for i in 0..@numOfFrames
				vd.merge!({ counter =>  nextRandomData() })
				addToExtractedFrames(vd[counter], counter)

				counter += @frameStep
			end
			return vd
		end

		def nextRandomData
			data = {}
			@detectableScoreGenerators.each do |dId, sg|
				# skip for this dId
				next if @rnd.rand > 0.3
				bboxes = []
				for i in 0..(@rnd.rand(5))
					sg.updateRandom(@rnd)
					bboxes << {
						score: sg.score,
						bbox: { x: sg.x, y: sg.y, width: sg.w, height: sg.h }
					}
				end
				data.merge!({dId => bboxes})
			end
			return data
		end
		# END: random
		# -----------------------------------------------------

		def addToExtractedFrames(generatedData, frameNumber)
			highestScore = 0
			generatedData.each do |dId, bboxes|
				bboxes.each do |bbox|
					highestScore = bbox[:score] if bbox[:score] > highestScore
				end
			end

			if highestScore > @frameExtractionThresh
				@extractedFrames << frameNumber
			end
		end

	end
end