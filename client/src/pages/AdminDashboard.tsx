import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useProducts } from "@/hooks/use-products";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { X, GripVertical, ImagePlus } from "lucide-react";
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
  "Shorts",
  "Ensemble"
];

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { data: products, isLoading } = useProducts();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const { toast } = useToast();

  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: "", description: "", details: "", price: "", category: "", inStock: true, quantity: "0", isVisible: true
  });

  // Multi-image state
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  // For edit mode: existing images from the product that the user wants to keep
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  // Settings State
  const [settings, setSettings] = useState({
    navMarquee: "", heroMarquee: ""
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) setLocation("/55TYUBBN");
    else setIsAuthorized(true);

    fetch("/api/site-settings")
      .then(res => res.json())
      .then(data => setSettings({ navMarquee: data.navMarquee || "", heroMarquee: data.heroMarquee || "" }))
      .catch(console.error);
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
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    // Add new files to existing list
    setImageFiles(prev => [...prev, ...files]);
    
    // Create previews for new files
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(prev => [...prev, ...newPreviews]);

    // Reset the input so same file can be re-selected
    e.target.value = "";
  };

  const removeNewImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    setExistingImageUrls(prev => prev.filter((_, i) => i !== index));
  };

  const resetForm = () => {
    setNewProduct({ name: "", description: "", details: "", price: "", category: "", inStock: true, quantity: "0", isVisible: true });
    setImageFiles([]);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
    setExistingImageUrls([]);
    setEditingId(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.category) {
      toast({ title: "Validation Error", description: "Please select a category.", variant: "destructive" });
      return;
    }
    
    const totalImages = existingImageUrls.length + imageFiles.length;
    if (totalImages === 0) {
      toast({ title: "Validation Error", description: "Please upload at least one image.", variant: "destructive" });
      return;
    }

    setIsAdding(true);
    const token = localStorage.getItem("admin_token");

    // Auto calculate ID based on highest existing ID if creating new
    const nextId = editingId || (products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1);

    try {
      // Convert all new image files to base64
      let imageBase64List: string[] = [];
      if (imageFiles.length > 0) {
        imageBase64List = await Promise.all(imageFiles.map(f => convertToBase64(f)));
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
          details: newProduct.details,
          price: parseFloat(newProduct.price.toString()) || 0,
          category: newProduct.category,
          imageBase64List: imageBase64List.length > 0 ? imageBase64List : undefined,
          existingImageUrls: editingId ? existingImageUrls : undefined,
          inStock: newProduct.inStock,
          quantity: parseInt(newProduct.quantity.toString(), 10) || 0,
          isVisible: newProduct.isVisible
        }),
      });

      if (response.ok) {
        toast({ title: "Success", description: `Product ${editingId ? "updated" : "added"} successfully!` });
        resetForm();
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
      details: product.details || "",
      price: product.price.toString(),
      category: product.category,
      inStock: product.inStock,
      quantity: product.quantity.toString(),
      isVisible: product.isVisible
    });
    // Load existing images
    setExistingImageUrls(product.imageUrls || [product.imageUrl]);
    setImageFiles([]);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews([]);
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

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    setIsSavingSettings(true);
    try {
      const response = await fetch("/api/site-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(settings)
      });
      if (response.ok) toast({ title: "Success", description: "Site settings saved successfully!" });
      else throw new Error();
    } catch {
      toast({ title: "Error", description: "Failed to save settings", variant: "destructive" });
    } finally {
      setIsSavingSettings(false);
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
        <h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Product" : "Add New Product"}</h2>
        <form onSubmit={handleAddProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Classic Tee" />
            </div>
            <div className="space-y-2">
              <Label>Price (in DH)</Label>
              <Input required type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="250" />
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
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input required type="number" value={newProduct.quantity} onChange={e => setNewProduct({...newProduct, quantity: e.target.value})} placeholder="10" />
            </div>
            <div className="flex items-center space-x-2 pt-8">
              <input 
                type="checkbox" 
                id="isVisible" 
                checked={newProduct.isVisible} 
                onChange={e => setNewProduct({...newProduct, isVisible: e.target.checked})}
                className="w-5 h-5 border-2 border-black rounded-none cursor-pointer"
              />
              <Label htmlFor="isVisible" className="cursor-pointer font-bold uppercase tracking-wider">Show in Store</Label>
            </div>

            {/* Multi-Image Upload Section */}
            <div className="space-y-4 md:col-span-2">
              <Label className="flex items-center gap-2">
                <ImagePlus className="w-4 h-4" />
                Product Images
                <span className="text-muted-foreground font-normal text-xs">
                  ({existingImageUrls.length + imageFiles.length} image{existingImageUrls.length + imageFiles.length !== 1 ? 's' : ''} selected)
                </span>
              </Label>
              
              {/* Existing Images (edit mode) */}
              {existingImageUrls.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Current Images</p>
                  <div className="flex flex-wrap gap-3">
                    {existingImageUrls.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <div className="w-24 h-24 border-2 border-black rounded-md overflow-hidden bg-muted">
                          <img src={url} alt={`Current ${index + 1}`} className="w-full h-full object-contain" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {index === 0 && (
                          <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-black text-white text-[9px] px-1.5 py-0.5 font-bold uppercase tracking-wider">
                            Main
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* New Images Preview */}
              {imagePreviews.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider">New Images to Upload</p>
                  <div className="flex flex-wrap gap-3">
                    {imagePreviews.map((url, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <div className="w-24 h-24 border-2 border-dashed border-green-600 rounded-md overflow-hidden bg-muted">
                          <img src={url} alt={`New ${index + 1}`} className="w-full h-full object-contain" />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* File Input */}
              <div className="flex items-center gap-3">
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border-2 border-black bg-muted hover:bg-accent transition-colors font-display font-bold uppercase tracking-wider text-sm brutalist-shadow-sm hover:translate-y-[1px] hover:translate-x-[1px] hover:shadow-none">
                  <ImagePlus className="w-4 h-4" />
                  Add Images
                  <Input 
                    type="file" 
                    accept="image/*" 
                    multiple
                    onChange={handleImageChange} 
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-muted-foreground">You can select multiple files at once</span>
              </div>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Description</Label>
              <Input value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} placeholder="A really nice shirt." />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label>Product Details <span className="text-muted-foreground font-normal">(specs, materials, care info…)</span></Label>
              <Textarea value={newProduct.details} onChange={e => setNewProduct({...newProduct, details: e.target.value})} placeholder="100% Cotton. Machine wash cold. Do not tumble dry." className="min-h-[100px]" />
            </div>
          </div>
          <div className="flex gap-4">
            <Button type="submit" disabled={isAdding}>
              {isAdding ? "Saving..." : (editingId ? "Update Product" : "Add Product to Store")}
            </Button>
            {editingId && (
              <Button type="button" variant="outline" onClick={resetForm}>
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
                    <th className="px-4 py-3">Images</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Qty</th>
                    <th className="px-4 py-3">Visible</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {products.map((product) => (
                    <tr key={product.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">{product.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          {(product.imageUrls || [product.imageUrl]).slice(0, 3).map((url, i) => (
                            <div key={i} className="w-8 h-8 border rounded overflow-hidden bg-muted flex-shrink-0">
                              <img src={url} alt="" className="w-full h-full object-contain" />
                            </div>
                          ))}
                          {(product.imageUrls || [product.imageUrl]).length > 3 && (
                            <div className="w-8 h-8 border rounded bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                              +{(product.imageUrls || [product.imageUrl]).length - 3}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium">{product.name}</td>
                      <td className="px-4 py-3">{product.category}</td>
                      <td className="px-4 py-3">{formatPrice(product.price)}</td>
                      <td className="px-4 py-3 font-bold">{product.quantity}</td>
                      <td className="px-4 py-3">
                        {product.isVisible ? (
                          <span className="text-green-600 font-bold uppercase text-xs">Yes</span>
                        ) : (
                          <span className="text-red-600 font-bold uppercase text-xs">No</span>
                        )}
                      </td>
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

      {/* Site Settings Section */}
      <div className="bg-card rounded-lg shadow border p-6 mb-8 mt-12">
        <h2 className="text-xl font-semibold mb-4">Site Settings (Marquees)</h2>
        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="space-y-2">
            <Label>Top Navigation Bar Text (Black Band)</Label>
            <Input 
              value={settings.navMarquee} 
              onChange={e => setSettings({...settings, navMarquee: e.target.value})} 
              placeholder="HOUSE OF STREETWEAR // 🔥 NEW COLLECTION DROPPING SOON 🔥" 
            />
          </div>
          <div className="space-y-2">
            <Label>Hero Section Text (Orange Band)</Label>
            <Input 
              value={settings.heroMarquee} 
              onChange={e => setSettings({...settings, heroMarquee: e.target.value})} 
              placeholder="VENTURES CLOTHING // MOROCCO // QUALITY STREETWEAR //" 
            />
          </div>
          <Button type="submit" disabled={isSavingSettings}>
            {isSavingSettings ? "Saving Settings..." : "Save Settings"}
          </Button>
        </form>
      </div>
    </div>
  );
}
