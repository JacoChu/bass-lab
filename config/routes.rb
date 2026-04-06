Rails.application.routes.draw do
  devise_for :users, controllers: {
    omniauth_callbacks: "users/omniauth_callbacks",
    sessions: "users/sessions"
  }

  # Two-factor authentication management
  scope "/users" do
    get    "two_factor/setup",   to: "users/two_factor#setup",   as: :two_factor_setup
    post   "two_factor/enable",  to: "users/two_factor#enable",  as: :two_factor_enable
    delete "two_factor",         to: "users/two_factor#disable", as: :two_factor_disable
  end

  # OTP verification step after primary credential check (separate controller avoids Devise routing conflicts)
  post "/users/sessions/verify_otp", to: "users/otp_sessions#create", as: :users_verify_otp

  devise_scope :user do
    get    "/admin/sign_in",  to: "devise/sessions#new",     as: :new_admin_session
    post   "/admin/sign_in",  to: "devise/sessions#create",  as: :admin_session
    delete "/admin/sign_out", to: "devise/sessions#destroy", as: :destroy_admin_session
  end

  namespace :admin do
    resources :users
    resources :orders, only: %i[index show new create edit update]
    resources :admin_users, only: %i[index edit update]

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

    resource :profile, only: %i[show update], controller: :profile do
      member do
        post :password
        patch :email
      end
    end

    resources :invitations, only: %i[create] do
      member do
        post :accept
      end
    end

    resources :sessions, only: [:destroy], constraints: { id: /[^\/]+/ } do
      collection do
        get :validate
      end
    end
  end

  root to: redirect("/admin")

  get "up" => "rails/health#show", as: :rails_health_check
end
