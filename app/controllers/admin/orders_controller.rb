module Admin
  class OrdersController < Admin::ApplicationController
    def scoped_resource
      scope = resource_class.all
      scope = scope.where(status: params[:status]) if params[:status].present?
      if params[:created_from].present?
        scope = scope.where("created_at >= ?", Date.parse(params[:created_from]).beginning_of_day)
      end
      if params[:created_to].present?
        scope = scope.where("created_at <= ?", Date.parse(params[:created_to]).end_of_day)
      end
      scope
    end
  end
end
