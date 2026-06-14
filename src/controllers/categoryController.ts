import { Request, Response } from 'express';
import Category from '../models/Category';
import Product from '../models/Product';

// Helper: Check if setting `parentId` as parent of `categoryId` would create a circular reference
async function wouldCreateCircular(categoryId: string, parentId: string): Promise<boolean> {
  let current = parentId;
  const visited = new Set<string>();
  
  while (current) {
    if (current === categoryId) return true;
    if (visited.has(current)) break; // safety: break if already visited
    visited.add(current);
    const parentCat = await Category.findById(current).select('parent');
    current = parentCat?.parent?.toString() || '';
  }
  
  return false;
}

export const getCategories = async (req: Request, res: Response) => {
  try {
    const { name, status } = req.query;
    const filter: any = {};

    if (name) {
      filter.name = { $regex: name as string, $options: 'i' };
    }
    if (status !== undefined && status !== '') {
      filter.status = status === 'true' || status === '1';
    }

    const categories = await Category.find(filter)
      .populate('parent', 'name')
      .sort({ sortOrder: 1, name: 1 });

    // Count products and subcategories for each category
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const productCount = await Product.countDocuments({ category: cat._id });
        const subcategoryCount = await Category.countDocuments({ parent: cat._id });
        return {
          ...cat.toObject(),
          productCount,
          subcategoryCount,
        };
      })
    );

    res.json(categoriesWithCount);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent', 'name');
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Also fetch subcategories of this category
    const subcategories = await Category.find({ parent: req.params.id })
      .sort({ sortOrder: 1, name: 1 });

    res.json({
      ...category.toObject(),
      subcategories,
    });
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getSubcategories = async (req: Request, res: Response) => {
  try {
    const parent = await Category.findById(req.params.id);
    if (!parent) {
      return res.status(404).json({ message: 'Parent category not found' });
    }

    const subcategories = await Category.find({ parent: req.params.id })
      .sort({ sortOrder: 1, name: 1 });

    // Include product count per subcategory
    const subcatsWithCount = await Promise.all(
      subcategories.map(async (sub) => {
        const productCount = await Product.countDocuments({ category: sub._id });
        const childCount = await Category.countDocuments({ parent: sub._id });
        return {
          ...sub.toObject(),
          productCount,
          subcategoryCount: childCount,
        };
      })
    );

    res.json(subcatsWithCount);
  } catch (error) {
    console.error('Error fetching subcategories:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parent, image, sortOrder, status, slug, metaTitle, metaDescription, metaKeywords } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Name is required' });
    }

    // Check for duplicate name
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ message: 'A category with this name already exists' });
    }

    // Validate parent exists if provided
    if (parent) {
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    const category = new Category({
      name,
      description,
      parent: parent || null,
      image,
      sortOrder: sortOrder || 0,
      status: status !== undefined ? status : true,
      slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
      metaTitle,
      metaDescription,
      metaKeywords,
    });

    const savedCategory = await category.save();
    const populated = await savedCategory.populate('parent', 'name');

    res.status(201).json(populated);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { name, description, parent, image, sortOrder, status, slug, metaTitle, metaDescription, metaKeywords } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Prevent setting parent to self
    if (parent && parent === req.params.id) {
      return res.status(400).json({ message: 'A category cannot be its own parent' });
    }

    // Prevent circular references (e.g. A -> B -> A)
    if (parent) {
      const isCircular = await wouldCreateCircular(req.params.id as string, parent as string);
      if (isCircular) {
        return res.status(400).json({ message: 'Cannot set this parent — it would create a circular reference' });
      }

      // Validate parent exists
      const parentCategory = await Category.findById(parent);
      if (!parentCategory) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    // Check for duplicate name (exclude self)
    if (name && name !== category.name) {
      const existing = await Category.findOne({ name, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ message: 'A category with this name already exists' });
      }
    }

    category.name = name || category.name;
    category.description = description !== undefined ? description : category.description;
    category.parent = parent || null;
    category.image = image !== undefined ? image : category.image;
    category.sortOrder = sortOrder !== undefined ? sortOrder : category.sortOrder;
    category.status = status !== undefined ? status : category.status;
    category.slug = slug || category.slug;
    category.metaTitle = metaTitle !== undefined ? metaTitle : category.metaTitle;
    category.metaDescription = metaDescription !== undefined ? metaDescription : category.metaDescription;
    category.metaKeywords = metaKeywords !== undefined ? metaKeywords : category.metaKeywords;

    const updated = await category.save();
    const populated = await updated.populate('parent', 'name');

    res.json(populated);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has children
    const children = await Category.countDocuments({ parent: req.params.id });
    if (children > 0) {
      return res.status(400).json({ message: 'Cannot delete a category that has subcategories. Delete or reassign children first.' });
    }

    // Check if products reference this category
    const productCount = await Product.countDocuments({ category: req.params.id });
    if (productCount > 0) {
      return res.status(400).json({ message: `Cannot delete this category. ${productCount} product(s) are assigned to it.` });
    }

    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

export const bulkDeleteCategories = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: 'No category IDs provided' });
    }

    // Check for children and products in any of the selected categories
    for (const id of ids) {
      const children = await Category.countDocuments({ parent: id });
      if (children > 0) {
        const cat = await Category.findById(id);
        return res.status(400).json({ message: `Cannot delete "${cat?.name}" — it has subcategories.` });
      }
      const productCount = await Product.countDocuments({ category: id });
      if (productCount > 0) {
        const cat = await Category.findById(id);
        return res.status(400).json({ message: `Cannot delete "${cat?.name}" — ${productCount} product(s) are assigned to it.` });
      }
    }

    await Category.deleteMany({ _id: { $in: ids } });
    res.json({ message: `${ids.length} category(ies) deleted successfully` });
  } catch (error) {
    console.error('Error bulk deleting categories:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};
