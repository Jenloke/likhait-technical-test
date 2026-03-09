class Api::CategoriesController < ApplicationController
  def index
    categories = Category.order(:name)
    render json: categories
  end

  def create
    category = Category.new(categories_params)

    if category.save
      render json: category, status: :created
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  private

  def categories_params
    params.require(:category).permit(:name, :emoji)
  end

  def format_categories(category)
    {
      name: category.name,
      emoji: category.emoji
    }
  end
end
