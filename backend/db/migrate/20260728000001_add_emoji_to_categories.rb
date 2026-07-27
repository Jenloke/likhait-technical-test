class AddEmojiToCategories < ActiveRecord::Migration[7.2]
  KNOWN_EMOJI = {
    "Food" => "🍔",
    "Transportation" => "🚗",
    "Entertainment" => "🎬",
    "Shopping" => "🛍️",
    "Bills" => "📄",
    "Healthcare" => "🏥",
    "Education" => "📚",
    "Travel" => "✈️",
    "Personal" => "📦",
    "Other" => "📦"
  }.freeze

  class Category < ActiveRecord::Base
  end

  def up
    # NOTE: the default is deliberately a plain ASCII string, not the emoji itself.
    # Baking a multibyte literal directly into a DDL DEFAULT clause here got mangled
    # to "?" by the DB regardless of connection charset; the real default is applied
    # at the app layer instead (see Category#set_default_emoji).
    add_column :categories, :emoji, :string, limit: 10, null: false, default: ""

    KNOWN_EMOJI.each do |name, emoji|
      Category.where(name: name).update_all(emoji: emoji)
    end
  end

  def down
    remove_column :categories, :emoji
  end
end
