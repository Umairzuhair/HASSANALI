
import { Search, X } from 'lucide-react';
import Image from 'next/image';

interface SearchBarProps {
  searchQuery: string;
  searchResults: Array<{
    id: string;
    name: string;
    image_url: string;
    category: string;
  }>;
  isSearching: boolean;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClose: () => void;
  onProductClick: (productId: string) => void;
}

export const SearchBar = ({
  searchQuery,
  searchResults,
  isSearching,
  onSearchChange,
  onClose,
  onProductClick,
}: SearchBarProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-24">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative">
        <button
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex items-center mb-4">
          <Search className="w-5 h-5 mr-2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={onSearchChange}
            className="flex-1 border-none outline-none text-lg"
            placeholder="Search products..."
            autoFocus
          />
        </div>
        {isSearching ? (
          <div className="text-center py-8 text-gray-500">Searching...</div>
        ) : (
          <ul className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {searchResults.length === 0 ? (
              <li className="py-4 text-center text-gray-500">No results found.</li>
            ) : (
              searchResults.map((product) => (
                <li
                  key={product.id}
                  className="py-3 px-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => onProductClick(product.id)}
                >
                  <Image
                    src={product.image_url} 
                    alt={product.name} 
                    className="w-12 h-12 object-cover rounded mr-4"
                    width={48}
                    height={48}
                    unoptimized
                  />
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-500">{product.category}</div>
                  </div>
                </li>
              ))
            )}
          </ul>
        )}
      </div>
    </div>
  );
}
