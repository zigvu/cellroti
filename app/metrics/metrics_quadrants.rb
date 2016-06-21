module Metrics
  class MetricsQuadrants
    def initialize(width, height, configReader)
      @width = width
      @height = height

      @numRows = configReader.dm_qd_numCols
      @numCols = configReader.dm_qd_numRows
      @centerWeight = configReader.dm_qd_centerWeight
      @cornerWeight = configReader.dm_qd_cornerWeight
      @nonCornerEdgeWeight = configReader.dm_qd_nonCornerEdgeWeight

      @quadrants = get_quadrant_boundaries()
      @quadrant_weights = get_quadrant_weights()
    end

    def get_quadrant_boundaries
      colSize = (@width / @numCols).to_i
      rowSize = (@height / @numRows).to_i
      numQuadrants = 0
      quadrants = {}
      for r in 0..(@numRows - 1) do
        rowStart = r * rowSize
        # rowEnd = r == (@numRows - 1) ? @height : (r + 1) * rowSize
        rowEnd = (r + 1) * rowSize
        for c in 0..(@numCols - 1) do
          colStart = c * colSize
          # colEnd = c == (@numCols - 1) ? @width : (c + 1) * colSize
          colEnd = (c + 1) * colSize
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

      quadrant_weights[0] = @cornerWeight
      quadrant_weights[1] = @nonCornerEdgeWeight
      quadrant_weights[2] = @cornerWeight
      quadrant_weights[3] = @nonCornerEdgeWeight
      quadrant_weights[4] = @centerWeight
      quadrant_weights[5] = @nonCornerEdgeWeight
      quadrant_weights[6] = @cornerWeight
      quadrant_weights[7] = @nonCornerEdgeWeight
      quadrant_weights[8] = @cornerWeight
      return quadrant_weights
    end

    def find_intersection_quadrants(detections)
      intersection_quads = {}
      # initialize data structure
      @quadrants.each do |qNum, qBbox|
        intersection_quads[qNum] = 0
      end
      # combine multiple detections
      detections.each do |detection|
        @quadrants.each do |qNum, qBbox|
          intersection_quads[qNum] += overlap(detection[:bbox], qBbox)
        end
      end
      # reweight
      @quadrants.each do |qNum, qBbox|
        intersection_quads[qNum] = intersection_quads[qNum] * @quadrant_weights[qNum]
      end
      #puts intersection_quads
      return intersection_quads
    end

    # overlap fraction based on area of bbox2
    def overlap(bbox1, bbox2)
      b1_x0 = bbox1[:x]
      b1_x3 = bbox1[:width] + bbox1[:x]
      b1_y0 = bbox1[:y]
      b1_y3 = bbox1[:height] + bbox1[:y]

      b2_x0 = bbox2[:x]
      b2_x3 = bbox2[:width] + bbox2[:x]
      b2_y0 = bbox2[:y]
      b2_y3 = bbox2[:height] + bbox2[:y]

      width = bbox2[:width]
      height = bbox2[:height]

      xOverlap = [0, ([b1_x3, b2_x3].min - [b1_x0, b2_x0].max)].max
      yOverlap = [0, ([b1_y3, b2_y3].min - [b1_y0, b2_y0].max)].max
      return (1.0 * xOverlap * yOverlap / (width * height))
    end

  end
end
