class Api::ExpensesController < ApplicationController
  rescue_from ActiveRecord::RecordNotFound, with: :not_found

  def index
    expenses = Expense.includes(:category).order(date: :desc, created_at: :desc)

    if params[:year].present? && params[:month].present?
      year = params[:year].to_i
      month = params[:month].to_i

      start_date = Date.new(year, month, 1)
      end_date = start_date.end_of_month

      expenses = expenses.where(date: start_date..end_date)
    end

    render json: expenses.map { |expense| format_expense(expense) }
  end

  def create
    category = Category.find_by!(name: params[:expense][:category])
    expense = Expense.new(expense_params.merge(category: category))

    if expense.save
      render json: format_expense(expense), status: :created
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_content
    end
  end

  def update
    expense = Expense.find(params[:id])

    if params[:expense].key?(:category)
      category = Category.find_by!(name: params[:expense][:category])
      expense.assign_attributes(expense_params.merge(category: category))
    else
      expense.assign_attributes(expense_params)
    end

    if expense.save
      render json: format_expense(expense)
    else
      render json: { errors: expense.errors.full_messages }, status: :unprocessable_content
    end
  end

  def destroy
    expense = Expense.find(params[:id])
    expense.destroy
    head :no_content
  end

  private

  def expense_params
    params.require(:expense).permit(:description, :amount, :date)
  end

  def format_expense(expense)
    {
      id: expense.id,
      description: expense.description,
      amount: expense.amount.to_f,
      category: expense.category.name,
      date: expense.date.to_s,
      created_at: expense.created_at,
      updated_at: expense.updated_at
    }
  end

  def not_found
    render json: { error: "Not found" }, status: :not_found
  end
end
