require 'json'
require 'csv'
include EventsHelper

module SeedHelpers
	class IntakeDetectableList
		def initialize(intakeListCSVFile)
			@csvData = {}
			counter = 0
			CSV.foreach(intakeListCSVFile) do |row|
				organizationName = row[0]
				organizationIndustry = row[1]
				detectableName = row[2]
				detectablePrettyName = row[3]
				detectableDescription = row[4]

				if counter == 0
					# don't do anything
				else
					if @csvData[organizationName] == nil
						@csvData[organizationName] = {
							industry: organizationIndustry,
							detectables: []
						}
					end
					@csvData[organizationName][:detectables] << {
						name: detectableName,
						pretty_name: detectablePrettyName,
						description: detectableDescription
					}
				end

				counter += 1
			end
		end

		def saveToDb
			@csvData.each do |org, orgData|
				# create org
				organization = Organization.where(name: org).first_or_create
				organization.update(industry: orgData[:industry])
				# create detectables
				orgData[:detectables].each do |d|
					organization.detectables.create(name: d[:name], pretty_name: d[:pretty_name], description: d[:description])
				end
			end
			true
		end
	end
end