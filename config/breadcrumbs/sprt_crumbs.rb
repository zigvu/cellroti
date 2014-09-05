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

