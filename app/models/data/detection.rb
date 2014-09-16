class Detection < ActiveRecord::Base

	def bbox
		return {
			x0: self.bbox_x, y0: self.bbox_y, 
			x3: self.bbox_x + self.bbox_width, y3: self.bbox_y + self.bbox_height
		}
	end

	def area
		return self.bbox_width * self.bbox_height
	end

  belongs_to :video_frame
  belongs_to :detectable
end
