// server/controllers/productController.js
const productModel = require('../models/productModel');

/**
 * GET /api/products
 */
const getAllProducts = async (req, res) => {
  try {
    const products = await productModel.findAllProducts();
    res.json(products);
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

/**
 * POST / PUT /api/products/manage
 */
const manageProduct = async (req, res) => {
  console.log('REQ BODY:', req.body);
  console.log('REQ USER:', req.user);
  console.log('REQ PARAMS:', req.params);

  const productId = req.params.id;

  let {
    name,
    description,
    price,
    stock_quantity,
    image_url,
    category_id,
  } = req.body;

  // Convert to correct types
  price = Number(price);
  stock_quantity = Number(stock_quantity);
  category_id = Number(category_id);

  if (!name || !price || !stock_quantity || !category_id) {
    return res.status(400).json({
      error: 'Missing required fields',
    });
  }

  try {
    let product;

    if (productId) {
      product = await productModel.updateProduct(
        productId,
        name,
        description,
        price,
        stock_quantity,
        image_url || null,
        category_id
      );
      return res.json({ message: 'Product updated', product });
    }

    product = await productModel.createProduct(
      name,
      description,
      price,
      stock_quantity,
      image_url || null,
      category_id
    );

    res.status(201).json({ message: 'Product created', product });
  } catch (err) {
    console.error('Error managing product:', err);
    res.status(500).json({ error: 'Product save failed' });
  }
};

/**
 * DELETE /api/products/manage/:id
 */
const deleteProduct = async (req, res) => {
  try {
    await productModel.deleteProduct(req.params.id);
    res.json({ message: 'Product deleted' });
  } catch (err) {
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Delete failed' });
  }
};

module.exports = {
  getAllProducts,
  manageProduct,
  deleteProduct,
};