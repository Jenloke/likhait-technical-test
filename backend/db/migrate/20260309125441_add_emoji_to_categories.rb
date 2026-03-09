class AddEmojiToCategories < ActiveRecord::Migration[7.2]
  def change
    add_column :categories, :emoji, :string, limit: 1, null: false
  end
end