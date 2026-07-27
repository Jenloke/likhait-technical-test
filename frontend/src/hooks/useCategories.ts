/**
 * Custom hook for fetching and creating expense categories
 */

import { useCallback, useEffect, useState } from "react";
import { Category } from "../types";
import { createCategory, fetchCategories } from "../services/api";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const addCategory = async (
    name: string,
    emoji?: string,
  ): Promise<Category> => {
    const category = await createCategory(name, emoji);
    setCategories((prev) =>
      [...prev, category].sort((a, b) => a.name.localeCompare(b.name)),
    );
    return category;
  };

  return { categories, loading, addCategory, refetch: loadCategories };
}