module Metrics
	class MetricsQuadrants
		def initialize(width, height, numRows, numCols)
			@width = width
			@height = height
			@numRows = numRows
			@numCols = numCols
			@totalQuadWeights = 15
		end

		def get_quadrant_boundaries
			colSize = (@width / @numCols).to_i
			rowSize = (@height / @numRows).to_i
			numQuadrants = 0
			quadrants = {}
			for r in 0..(@numRows - 1) do
				rowStart = r * rowSize
				rowEnd = r == (@numRows - 1) ? @height : (r + 1) * rowSize
				for c in 0..(@numCols - 1) do
					colStart = c * colSize
					colEnd = c == (@numCols - 1) ? @width : (c + 1) * colSize
					quadrants[numQuadrants] = {
						x: colStart, 
						y: rowStart, 
						width: colEnd - colStart, 
						height: rowEnd - rowStart
					}
					numQuadrants = numQuadrants + 1
					#puts "c,r: (#{colStart}, #{rowStart}), (#{colEnd}, #{rowEnd})"
				end
			end

			return quadrants
		end

		def get_quadrant_weights
			quadrant_weights = {}			
			quadrant_weights[0] = (1.0/@totalQuadWeights)
			quadrant_weights[1] = (2.0/@totalQuadWeights)
			quadrant_weights[2] = (1.0/@totalQuadWeights)
			quadrant_weights[3] = (2.0/@totalQuadWeights)
			quadrant_weights[4] = (3.0/@totalQuadWeights)
			quadrant_weights[5] = (2.0/@totalQuadWeights)
			quadrant_weights[6] = (1.0/@totalQuadWeights)
			quadrant_weights[7] = (2.0/@totalQuadWeights)
			quadrant_weights[8] = (1.0/@totalQuadWeights)
			return quadrant_weights
		end

	end
end