crumb :root do
  link "Home", root_path
end

# Sports management
crumb :sports do
  link "Sports", sprt_sports_path
end

crumb :sport do |sport|
  link sport.name, sprt_sport_path(sport)
  parent :sports
end

crumb :sport_edit do |sport|
  link sport.name, sprt_sport_path(sport)
  parent :sports
end

crumb :sport_new do
  link "New sport"
  parent :sports
end

# League management
crumb :league do |league|
  link league.name, sprt_league_path(league)
  parent :sport, league.sport
end

crumb :league_edit do |league|
  link league.name, sprt_league_path(league)
  parent :sport, league.sport
end

crumb :league_new do |sport|
  link "New league"
  parent :sport, sport
end

# Season management
crumb :season do |season|
  link season.name, sprt_season_path(season)
  parent :league, season.league
end

crumb :season_edit do |season|
  link season.name, sprt_season_path(season)
  parent :league, season.league
end

crumb :season_new do |league|
  link "New season"
  parent :league, league
end

# Game management
crumb :game do |game|
  link game.name, sprt_game_path(game)
  parent :season, game.season
end

crumb :game_edit do |game|
  link game.name, sprt_game_path(game)
  parent :season, game.season
end

crumb :game_new do |season|
  link "New game"
  parent :season, season
end


# Event management
crumb :event_edit do |event|
  link event.event_type.name
  parent :game, event.game
end

crumb :event_new do |game|
  link "New Game Event"
  parent :game, game
end

# EventType management
crumb :event_type do |event_type|
  link event_type.name, sprt_event_type_path(event_type)
  parent :sport, event_type.sport
end

crumb :event_type_edit do |event_type|
  link event_type.name, sprt_event_type_path(event_type)
  parent :sport, event_type.sport
end

crumb :event_type_new do |sport|
  link "New Event Type"
  parent :sport, sport
end

# Team management
crumb :team do |team|
  link team.name, sprt_team_path(team)
  parent :league, team.league
end

crumb :team_edit do |team|
  link team.name, sprt_team_path(team)
  parent :league, team.league
end

crumb :team_new do |league|
  link "New team"
  parent :league, league
end
