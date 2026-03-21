import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const CATEGORIES = [
  "Hoodies",
  "Sweaters",
  "T-Shirts",
  "Regular Pants",
  "Baggy Pants",
  "Shorts"
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useProducts();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", price: "", category: "", inStock: true
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) setLocation("/55TYUBBN");
    else setIsAuthorized(true);
  }, [setLocation]);

  const handleLogout = () => {
    localStorage.removeItem("admin_token");
    setLocation("/55TYUBBN");
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.category) {
      toast({ title: "Validation Error", description: "Please select a category.", variant: "destructive" });
      return;
    }
    if (!editingId && !imageFile) {
      toast({ title: "Validation Error", description: "Please upload an image.", variant: "destructive" });
      return;
    }

    setIsAdding(true);
    const token = localStorage.getItem("admin_token");

    // Auto calculate ID based on highest existing ID if creating new
    const nextId = editingId || (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1);

    try {
      let imageBase64 = undefined;
      if (imageFile) {
        imageBase64 = await convertToBase64(imageFile);
      }

      let imageUrl = undefined;
      if (editingId && !imageBase64) {
        imageUrl = products.find(p => p.id === editingId)?.imageUrl;
      }

      const response = await fetch("/api/admin/products", {
        method: editingId ? "PUT" : "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          id: nextId,
          name: newProduct.name,
          description: newProduct.description,
          price: parseInt(newProduct.price.toString(), 10),
          category: newProduct.category,
          imageBase64: imageBase64,
          imageUrl: imageUrl,
          inStock: newProduct.inStock
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: `Product ${editingId ? "updated" : "added"} successfully!` });
        setNewProduct({ name: "", description: "", price: "", category: "", inStock: true });
        setImageFile(null);
        setImagePreview(null);
        setEditingId(null);
        // User will need to refresh for now to see the new CSV cache unless we reload.
      } else {
        const error = await response.json();
        toast({ title: "Failed", description: error.message, variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error", variant: "destructive" });
    } finally {
      setIsAdding(false);
    }
  };

  const handleEditClick = (product: any) => {
    setEditingId(product.id);
    setNewProduct({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      category: product.category,
      inStock: product.inStock
    });
    setImagePreview(product.imageUrl);
    setImageFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    const token = localStorage.getItem("admin_token");
    try {
      const response = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        toast({ title: "Success", description: "Product deleted! Refresh page to see changes." });
      } else {
        const err = await response.json();
        toast({ title: "Failed", description: err.message, variant: "destructive" });
      }
    } catch (e) {
      toast({ title: "Error", description: "Failed to delete product.", variant: "destructive" });
    }
  };

  if (!isAuthorized) return null;

  return (
    <div className="container mx-auto pt-32 pb-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Store Admin Dashboard</h1>
        <Button variant="destructive" onClick={handleLogout} className="font-bold border-2 border-black brutalist-shadow-sm hover:translate-y-[2px] hover:translate-x-[2px] hover:shadow-none transition-all">
          LOGOUT
        </Button>
      </div>

      <div className="bg-card rounded-lg shadow border p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Add New Product</h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Classic Tee" />
            </div>
            <div className="space-y-2">
              <Label>Price (in Centimes - e.g 2500 for 25.00 MAD)</Label>
              <Input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="2500" />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={newProduct.category} onValueChange={(val) => setNewProduct({...newProduct, category: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-4">
              <Label>Product Image {editingId && "(Leave empty to keep current image)"}</Label>
              <Input 
                type="file" 
                accept="image/*" 
                required={!editingId}
                onChange={handleImageChange} 
                className="cursor-pointer"
              />
              {imagePreview && (
                <div className="mt-2 w-full max-w-[200px] border rounded-md overflow-hidden aspect-square">
                  <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="A really nice shirt." />
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={isAdding}>
              {isAdding ? "Saving..." : (editingId ? "Update Product" : "Add Product to Store")}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={() => {
                setEditingId(null);
                setNewProduct({ name: "", description: "", price: "", category: "", inStock: true });
                setImageFile(null);
                setImagePreview(null);
              }}>
                Cancel Edit
              </Button>
            )}
          </div>
        </form>
      </div>

      <div className="bg-card rounded-lg shadow border p-6">
        <h2 className="text-xl font-semibold mb-4">Current Inventory</h2>
        {isLoading ? (
          <p>Loading products from Google Sheet CSV...</p>
        ) : (
          <div className="space-y-4">
            <p className="text-muted-foreground mb-6">Currently displaying <strong>{products.length}</strong> products.</p>
            <div className="mt-8 border rounded-md overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted text-muted-foreground uppercase">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">{product.id}</td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{product.category}</td>
                      <td className="px-4 py-3">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3 flex gap-2 justify-end">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(product)}>Edit</Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(product.id)}>Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
