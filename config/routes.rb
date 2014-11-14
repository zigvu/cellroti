Cellroti::Application.routes.draw do

  namespace :admin do
    resources :clients do
      member do
        get 'groups'
        get 'detectables'
        get 'users'
      end
    end

    resources :organizations, :det_groups
  end

  namespace :analytics do
    resources :det_groups, :path => "brands/groups", except: [:show]
    resources :seasons, only: [:index, :show]
  end

  namespace :sprt do
    resources :sports, :teams, :event_types, :events
    resources :games, :leagues, :seasons
  end

  #namespace :api, :path => "", :constraints => {:subdomain => "api"} do
  namespace :api, :defaults => {:format => :json} do
    namespace :v1 do
      resources :det_groups, :path => "brands/groups", only: [:index, :show]
      get 'data/detectables' => 'data#detectables'
      resources :seasons, :path => "analytics/seasons", only: [:index, :show] do
        member do
          get 'data'
        end
      end
      #resources :videos, :path => "data/videos"
    end
  end

  devise_for :users
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
