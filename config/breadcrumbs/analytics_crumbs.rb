crumb :analytics_root do
  link "Analytics", analytics_det_groups_path
end

# Season Analysis
crumb :analytics_seasons do
	link "Seasons", analytics_seasons_path
	parent :analytics_root
end

crumb :analytics_season_show do |season|
	link season.name, analytics_season_path(season)
	parent :analytics_seasons
end
