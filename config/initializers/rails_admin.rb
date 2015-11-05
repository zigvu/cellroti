RailsAdmin.config do |config|

  Rails.application.eager_load!
  config.included_models = ActiveRecord::Base.descendants.map!(&:name)

  ### Popular gems integration

  ## == Devise ==
  config.authenticate_with do
    warden.authenticate! scope: :user
  end
  config.current_user_method(&:current_user)

  ## == Cancan ==
  # config.authorize_with :cancan

  ## == PaperTrail ==
  # config.audit_with :paper_trail, 'User', 'PaperTrail::Version' # PaperTrail >= 3.0.0

  config.authorize_with do
    redirect_to main_app.root_path unless States::Roles.zigvu_admin_and_above(current_user)
  end

  ### More at https://github.com/sferik/rails_admin/wiki/Base-configuration

  config.actions do
    dashboard                     # mandatory
    index                         # mandatory
    new
    export
    # bulk_delete                 # disabled by evan
    show
    edit
    delete
    show_in_app

    ## With an audit adapter, you can add:
    # history_index
    # history_show
  end
end
