Cellroti::Application.routes.draw do
  root 'analytics/charting#dashboard'

  namespace :admin do
    resources :organizations, :det_groups
    resources :clients do
      member do
        get 'seasons'
        post 'updateSeasons'
        get 'groups'
        get 'detectables'
      end
      resources :users, controller: 'clients_users', except: [:show]
    end

    get 'metrics' => 'metrics#index'
    get 'metrics/change'
  end

  namespace :analytics do
    resources :seasons, only: [:index, :show] do
      member do
        get 'summary'
        get 'game/:game_id' => 'seasons#game', :as => :game
        post 'updateDetGroups'
      end
    end

    get 'dashboard' => 'charting#dashboard'
    get 'analysis' => 'charting#analysis'
    get 'discover' => 'charting#discover'
  end

  #namespace :api, :path => "", :constraints => {:subdomain => "api"} do
  namespace :api, :defaults => {:format => :json} do
    # client facing API
    namespace :v1 do
      # det_groups resource is NOT currently used - future API endpoints
      resources :det_groups, :path => 'brands/groups', only: [:index, :show]

      resources :seasons, :path => 'analytics/seasons', only: [:index, :show] do
        member do
          get 'summary'
          get 'game/:game_id' => 'seasons#game', :as => :game
          get 'filter'
        end
      end
    end

    # kheer APIs
    namespace :stream do
      resources :sports, :event_types, :leagues, :seasons, :sub_seasons, :teams
      resources :games, :game_teams, :events, :channels
      resources :json_data, only: [:create]
      resources :frame_data, only: [:index]
    end
  end

  # devise_for :users
  devise_for :users, skip: [:invitation, :registrations]
  devise_scope :user do
    resource :invitation,
      only: [],
      path: 'users',
      controller: 'devise/invitations',
      as: :user_invitation do
        get :edit, :as => :accept, path: 'invitation/accept'
        put :update, path: 'invitation'
      end

    resource :registrations,
      except: [:new, :show],
      path: 'users',
      controller: 'devise_invitable/registrations',
      as: :user_registration
  end

  authenticated :user, -> user { States::Roles.zigvu_admin_and_above(user) } do
    mount RailsAdmin::Engine => '/rails_admin', as: 'rails_admin'
  end

  authenticated :user, -> user { States::Roles.zigvu_user_and_above(user) } do
    match '/delayed_job' => DelayedJobWeb, :anchor => false, via: [:get, :post]
  end

  # The priority is based upon order of creation: first created -> highest priority.
  # See how all your routes lay out with "rake routes".

  # You can have the root of your site routed with "root"
  # root 'welcome#index'

  # Example of regular route:
  #   get 'products/:id' => 'catalog#view'

  # Example of named route that can be invoked with purchase_url(id: product.id)
  #   get 'products/:id/purchase' => 'catalog#purchase', as: :purchase

  # Example resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Example resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Example resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Example resource route with more complex sub-resources:
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', on: :collection
  #     end
  #   end

  # Example resource route with concerns:
  #   concern :toggleable do
  #     post 'toggle'
  #   end
  #   resources :posts, concerns: :toggleable
  #   resources :photos, concerns: :toggleable

  # Example resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end
end
