require "administrate/base_dashboard"

class AdminUserDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id:           Field::Number,
    email:        Field::String,
    display_name: Field::String,
    role:         Field::Select.with_options(
                    searchable: false,
                    collection: ->(field) { User.roles.keys }
                  ),
    created_at:   Field::DateTime,
  }.freeze

  SHOW_PAGE_ATTRIBUTES = %i[id email display_name role created_at].freeze

  COLLECTION_ATTRIBUTES = %i[id email display_name role created_at].freeze

  FORM_ATTRIBUTES = %i[email display_name role].freeze

  COLLECTION_FILTERS = {}.freeze
end
