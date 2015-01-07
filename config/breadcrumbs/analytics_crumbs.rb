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

crumb :analytics_season_summary do |season|
	link "Summary", summary_analytics_season_path(season)
	parent :analytics_season_show, season
end
