import { Router } from "express";
import { asyncRoute } from "../asyncRoute.js";
import { localEnv } from "../env.js";
import { addProduct, deleteProduct, listProducts, updateProduct } from "../store.js";

const router = Router();

router.get("/", asyncRoute(async (req, res) => {
  res.json({ items: await listProducts(localEnv()) });
}));

router.post("/", asyncRoute(async (req, res) => {
  res.status(201).json({ item: await addProduct(localEnv(), req.body) });
}));

router.put("/:id", asyncRoute(async (req, res) => {
  res.json({ item: await updateProduct(localEnv(), req.params.id, req.body) });
}));

router.delete("/:id", asyncRoute(async (req, res) => {
  res.json(await deleteProduct(localEnv(), req.params.id));
}));

export default router;
