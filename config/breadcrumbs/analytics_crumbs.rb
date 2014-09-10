crumb :analytics_root do
  link "Analytics", analytics_det_groups_path
end

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

