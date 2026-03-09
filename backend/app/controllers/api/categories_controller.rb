class Api::CategoriesController < ApplicationController
  rescue_from ActiveRecord::RecordNotFound do
    render json: { error: "Category not found" }, status: :not_found
  end

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

  def update
    category = Category.find_by!(name: params[:id])

    if category.update(categories_params)
      render json: category
    else
      render json: { errors: category.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def destroy
    category = Category.find_by!(name: params[:id])
    category.destroy
    head :no_content
  end

  private

  def categories_params
    params.require(:category).permit(:name, :emoji)
  end
end
