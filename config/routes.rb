Rails.application.routes.draw do
  devise_for :users

  devise_scope :user do
    get    "/admin/sign_in",  to: "devise/sessions#new",     as: :new_admin_session
    post   "/admin/sign_in",  to: "devise/sessions#create",  as: :admin_session
    delete "/admin/sign_out", to: "devise/sessions#destroy", as: :destroy_admin_session
  end

  namespace :admin do
    resources :users
    resources :orders
    resources :admin_users

    root to: "users#index"
  end

  namespace :api do
    resources :friends, only: %i[index destroy] do
      collection do
        resources :requests, controller: "friend_requests", only: %i[index create destroy] do
          member do
            post :accept
          end
        end
      end
    end

    resources :subscriptions, only: %i[index destroy]
  end

  get "up" => "rails/health#show", as: :rails_health_check
end
