class Ability
  include CanCan::Ability

  def initialize(user)
    return unless user

    if user.super_admin?
      can :manage, :all
    elsif user.staff?
      can :read, User
      can :read, Order
    end
  end
end
