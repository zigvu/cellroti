module Jsonifiers
	class JAnalytics
		def initialize
		end

		def to_json
			return get_data_hash().to_json
		end

		def to_csv
			raise RuntimeError("Not implemented yet")
		end
	end
end