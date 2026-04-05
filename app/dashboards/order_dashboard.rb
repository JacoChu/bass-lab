require "administrate/base_dashboard"

class OrderDashboard < Administrate::BaseDashboard
  ATTRIBUTE_TYPES = {
    id:           Field::Number,
    user:         Field::BelongsTo,
    status:       Field::Select.with_options(
                    searchable: false,
                    collection: ->(field) { Order.statuses.keys }
                  ),
    period:       Field::Select.with_options(
                    searchable: false,
                    collection: ->(field) { Order.periods.keys + [ nil ] }
                  ),
    amount_cents: Field::Number,
    expires_at:   Field::DateTime,
    created_at:   Field::DateTime,
    updated_at:   Field::DateTime,
  }.freeze

  COLLECTION_ATTRIBUTES = %i[id user status period amount_cents expires_at created_at].freeze

  SHOW_PAGE_ATTRIBUTES = %i[id user status period amount_cents expires_at created_at updated_at].freeze

  FORM_ATTRIBUTES = %i[status period amount_cents expires_at].freeze

  COLLECTION_FILTERS = {
    confirmed: ->(resources) { resources.where(status: :confirmed) },
    pending:   ->(resources) { resources.where(status: :pending) },
    cancelled: ->(resources) { resources.where(status: :cancelled) },
  }.freeze
end
