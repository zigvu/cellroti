module Serializers
	class FieldSerializer
		def initialize(tableObject, tableColumnAndTypes)
			@tableObject = tableObject
			@tableColumnAndTypes = tableColumnAndTypes
		end

		# serialization methods for sub classes
		def getX(columnName, hashKeyName)
			column = @tableObject.send(columnName)
			hashValue = column[hashKeyName]
			hashValue.to_a
		end

		def addX(columnName, hashKeyName, hashValueArray)
			column = @tableObject.send(columnName)
			column[hashKeyName].merge([hashValueArray].flatten)
			@tableObject.update({columnName => column})
		end

		def removeX(columnName, hashKeyName, hashValueArray)
			column = @tableObject.send(columnName)
			column[hashKeyName].subtract([hashValueArray].flatten)
			@tableObject.update({columnName => column})
		end

		def resetX(columnName, hashKeyName)
			column = @tableObject.send(columnName)
			column[hashKeyName].clear
			@tableObject.update({columnName => column})
		end

		def setDefaultField(columnName)
			@tableColumnAndTypes.each do |fv|
				if fv[0] == columnName
					column = {}
					fv[1].each do |mn|
						column.merge!(mn => [].to_set)
					end
					return @tableObject.update({columnName => column})
				end
			end
			return false
		end

	end
end
