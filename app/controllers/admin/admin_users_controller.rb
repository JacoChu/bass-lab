module Admin
  class AdminUsersController < Admin::ApplicationController
    def scoped_resource
      User.all.order(:created_at)
    end

    def permitted_attributes
      if action_name.in?(%w[create])
        [ :email, :display_name, :role, :password, :password_confirmation ]
      else
        [ :display_name, :role ]
      end
    end
  end
end
