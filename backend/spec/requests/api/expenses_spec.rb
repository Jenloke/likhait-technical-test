require 'rails_helper'

RSpec.describe "Api::Expenses", type: :request do
  let!(:food_category) { Category.create!(name: "Food") }
  let!(:transport_category) { Category.create!(name: "Transport") }

  describe "GET /api/expenses" do
  let!(:expense1) { Expense.create!(description: "Lunch", amount: 100.00, category: food_category, date: Date.today) }
  let!(:expense2) { Expense.create!(description: "Taxi", amount: 50.00, category: transport_category, date: Date.today) }

    it "returns all expenses with category information" do
      get "/api/expenses"

      expect(response).to have_http_status(:success)
      json = JSON.parse(response.body)
      expect(json.length).to eq(2)
    end

    it "returns expenses in descending order by date, falling back to created_at for ties" do
      get "/api/expenses"

      json = JSON.parse(response.body)
      expect(json.first["id"]).to eq(expense2.id)
      expect(json.last["id"]).to eq(expense1.id)
    end

    it "ranks a backdated expense last even though it was created most recently" do
      backdated_expense = Expense.create!(
        description: "Old receipt", amount: 20.00, category: food_category, date: Date.today - 30
      )

      get "/api/expenses"

      json = JSON.parse(response.body)
      expect(json.last["id"]).to eq(backdated_expense.id)
    end

    it "puts a newly added today-dated expense at the top, ahead of previously created same-day entries" do
      post "/api/expenses", params: {
        expense: { description: "Team Lunch", amount: 42.00, category_id: food_category.id, date: Date.today }
      }, as: :json
      new_expense_id = JSON.parse(response.body)["id"]

      get "/api/expenses"

      json = JSON.parse(response.body)
      expect(json.first["id"]).to eq(new_expense_id)
    end

    describe "with year/month params" do
      it "includes a March-dated expense entered in January, and excludes an April-dated expense entered in March" do
        march_expense = Expense.create!(
          description: "March conference", amount: 300.00, category: food_category,
          date: Date.new(2026, 3, 15), created_at: Date.new(2026, 1, 5)
        )
        april_expense = Expense.create!(
          description: "April rent", amount: 500.00, category: food_category,
          date: Date.new(2026, 4, 1), created_at: Date.new(2026, 3, 20)
        )

        get "/api/expenses", params: { year: 2026, month: 3 }

        json = JSON.parse(response.body)
        ids = json.map { |expense| expense["id"] }
        expect(ids).to include(march_expense.id)
        expect(ids).not_to include(april_expense.id)
      end
    end
  end

  describe "POST /api/expenses" do
    let(:base_params) do
      { description: "Team Lunch", amount: 150.50, category_id: food_category.id, date: Date.today }
    end

    context "with valid parameters" do
      it "creates a new expense" do
        expect {
          post "/api/expenses", params: { expense: base_params }, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
        json = JSON.parse(response.body)
        expect(json["description"]).to eq("Team Lunch")
        expect(json["amount"]).to eq("150.5")
      end
    end

    context "with invalid parameters" do
      it "with negative amounts" do
        params = { expense: base_params.merge(amount: -100.00) }

        expect {
          post "/api/expenses", params: params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it "with empty descriptions" do
        params = { expense: base_params.merge(description: "") }

        expect {
          post "/api/expenses", params: params, as: :json
        }.to change(Expense, :count).by(1)

        expect(response).to have_http_status(:created)
      end

      it "with a future date" do
        params = { expense: base_params.merge(date: Date.tomorrow) }

        expect {
          post "/api/expenses", params: params, as: :json
        }.not_to change(Expense, :count)

        expect(response).to have_http_status(:unprocessable_entity)
        json = JSON.parse(response.body)
        expect(json["errors"]).to include("Date must be less than or equal to #{Date.current}")
      end
    end
  end
end
