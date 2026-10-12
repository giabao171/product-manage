import { useEffect, useState } from "react";
import { requestJson } from "../api.js";

const emptyForm = {
  mode: "add",
  id: "",
  name: "",
  sku: "",
  price: "",
  categoryId: "",
  description: "",
};

/**
 * Format a price for the table.
 *
 * @param price Stored price
 * @return Price text
 */
function money(price) {
  return Number(price).toFixed(2);
}

/**
 * Render the product table and editor.
 *
 * @return Product page
 */
export default function Products() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState("");

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [productBody, categoryBody] = await Promise.all([
          requestJson("/api/products", { fallback: "Could not load products" }),
          requestJson("/api/categories", { fallback: "Could not load categories" }),
        ]);
        if (cancelled) {
          return;
        }
        setItems(Array.isArray(productBody.items) ? productBody.items : []);
        setCategories(Array.isArray(categoryBody.items) ? categoryBody.items : []);
        setLoaded(true);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError.message || "Could not load products");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  /**
   * Open a blank add form.
   */
  function openAdd() {
    setError("");
    setForm({
      ...emptyForm,
      categoryId: categories[0]?.id || "",
    });
  }

  /**
   * Open the edit form for one product.
   *
   * @param item Product row
   */
  function openEdit(item) {
    setError("");
    setForm({
      mode: "edit",
      id: item.id,
      name: item.name || "",
      sku: item.sku || "",
      price: item.price ?? "",
      categoryId: item.categoryId || "",
      description: item.description || "",
    });
  }

  /**
   * Update one field in the open form.
   *
   * @param field Field name
   * @param value Field value
   */
  function updateForm(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  /**
   * Save the open form as a new or updated product.
   *
   * @param event Submit event
   */
  async function saveForm(event) {
    event.preventDefault();
    if (!form.name.trim()) {
      setError("Name is required");
      return;
    }
    if (!form.categoryId) {
      setError("Category is required");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const body = await requestJson(form.mode === "add" ? "/api/products" : `/api/products/${form.id}`, {
        method: form.mode === "add" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        fallback: "Could not save the product",
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          price: form.price,
          categoryId: form.categoryId,
          description: form.description,
        }),
      });
      setItems((current) => {
        if (form.mode === "add") {
          return [body.item, ...current];
        }
        return current.map((item) => (item.id === form.id ? body.item : item));
      });
      setForm(null);
    } catch (saveError) {
      setError(saveError.message || "Could not save the product");
    } finally {
      setSaving(false);
    }
  }

  /**
   * Delete one product after confirmation.
   *
   * @param item Product row
   */
  async function removeItem(item) {
    if (!window.confirm(`Delete ${item.name}?`)) {
      return;
    }
    setDeletingId(item.id);
    setError("");
    try {
      await requestJson(`/api/products/${item.id}`, {
        method: "DELETE",
        fallback: "Could not delete the product",
      });
      setItems((current) => current.filter((row) => row.id !== item.id));
      if (form?.id === item.id) {
        setForm(null);
      }
    } catch (deleteError) {
      setError(deleteError.message || "Could not delete the product");
    } finally {
      setDeletingId("");
    }
  }

  return (
    <>
      {error && <p className="message error">{error}</p>}
      <div className="toolbar">
        <button type="button" className="primary" onClick={openAdd}>
          Add
        </button>
      </div>
      {form && (
        <form className="config-form" onSubmit={saveForm}>
          <label>
            Name
            <input value={form.name} onChange={(event) => updateForm("name", event.target.value)} />
          </label>
          <label>
            SKU
            <input value={form.sku} onChange={(event) => updateForm("sku", event.target.value)} />
          </label>
          <label>
            Price
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => updateForm("price", event.target.value)}
            />
          </label>
          <label>
            Category
            <select value={form.categoryId} onChange={(event) => updateForm("categoryId", event.target.value)}>
              {categories.length === 0 && <option value="">No categories</option>}
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Description
            <textarea value={form.description} onChange={(event) => updateForm("description", event.target.value)} />
          </label>
          <div className="form-actions">
            <button type="submit" className="primary" disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </button>
            <button type="button" className="secondary" onClick={() => setForm(null)} disabled={saving}>
              Cancel
            </button>
          </div>
        </form>
      )}
      <div className="table-wrap">
        <table className="config-table product-table">
          <thead>
            <tr>
              <th className="col-no">No</th>
              <th className="col-name">Name</th>
              <th className="col-sku">SKU</th>
              <th className="col-category">Category</th>
              <th className="col-price">Price</th>
              <th>Description</th>
              <th className="col-action">Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={item.id}>
                <td className="col-no">{index + 1}</td>
                <td className="col-name">{item.name}</td>
                <td className="col-sku">{item.sku}</td>
                <td className="col-category">{item.categoryName}</td>
                <td className="col-price">{money(item.price)}</td>
                <td>
                  <span className="cell-ellipsis" title={item.description}>
                    {item.description}
                  </span>
                </td>
                <td className="col-action">
                  <div className="row-actions">
                    <button type="button" className="secondary" onClick={() => openEdit(item)}>
                      Edit
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => removeItem(item)}
                      disabled={deletingId === item.id}
                    >
                      {deletingId === item.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {loaded && items.length === 0 && (
              <tr>
                <td className="empty" colSpan={7}>
                  No products yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
