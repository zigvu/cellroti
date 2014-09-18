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

# <!-- BEGIN: Breadcrumbs -->
# <% if user_signed_in? %>
#   <div class="row">
#     <div class="small-12 columns">
#       <ul class="breadcrumbs">
#         <li><a href="#">Season Analysis</a></li>
#         <li><a href="#">World Cup 2014</a></li>
#         <li class="current"><a href="#">Summary</a></li>
#       </ul>
#     </div>
#   </div>
# <% else %>
#   <!-- No breadcrumbs -->
# <% end %>
# <!-- END: Breadcrumbs -->

# Brand Groups
crumb :det_groups do
  link "Brand Groups", analytics_det_groups_path
  parent :analytics_root
end

crumb :det_group_edit do |det_group|
  link det_group.name, analytics_det_group_path(det_group)
  parent :det_groups
end

crumb :det_group_new do
  link "New Brand Group"
  parent :det_groups
end

