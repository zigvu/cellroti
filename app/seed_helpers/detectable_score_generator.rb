
module SeedHelpers
	class DetectableScoreGenerator
		attr_accessor :score, :x, :y, :w, :h

		def initialize(score, x, y, w, h)
			@width = 1280
			@height = 720

			@score_orig = score || 0
			@x_orig = x || 0
			@y_orig = y || 0
			@w_orig = w || (@width/10).to_i
			@h_orig = h || (@height/10).to_i

			@sineSteps = 10
			@sineTrendingUp = true

			reset()
		end

		def reset
			@score = @score_orig
			@x = @x_orig
			@y = @y_orig
			@w = @w_orig
			@h = @h_orig
		end

		def updateSine
			if @sineTrendingUp
				@score += 1.0/@sineSteps
				@x += (@width/@sineSteps).to_i
				@y += (@height/@sineSteps).to_i

				# go up to 0.9
				@sineTrendingUp = (@score < 0.81)
			else
				@score -= 1.0/@sineSteps
				@x -= (@width/@sineSteps).to_i
				@y -= (@height/@sineSteps).to_i

				# go down to 0.0
				@sineTrendingUp = (@score < 0.09)
			end
		end

		def updateRandom(rnd)
			@score = rnd.rand()
			@x = rnd.rand(@width)
			@y = rnd.rand(@height)
			@w = rnd.rand(@width - x)
			@h = rnd.rand(@height - y)
		end

	end
end