import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState
} from 'react';
import { Product } from '../../types.ts';
import { useProductStore } from '../stores/useProductStore.ts';

interface EditingProductContextProps {
  children: ReactNode;
}

interface EditingProductContextType {
  editingProduct: Product | null;
  setEditingProduct: Dispatch<SetStateAction<Product | null>>;
  handleProductNameUpdate: (productId: string, newName: string) => void;
  handleEditProduct: (product: Product) => void;
  handleEditComplete: VoidFunction;
}

const EditingProductContext = createContext<EditingProductContextType | null>(
  null
);

export const EditingProductProvider = ({
  children
}: EditingProductContextProps) => {
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const { updateProduct } = useProductStore();

  // 새로운 핸들러 함수 추가
  const handleProductNameUpdate = (productId: string, newName: string) => {
    if (editingProduct && editingProduct.id === productId) {
      const updatedProduct = { ...editingProduct, name: newName };
      setEditingProduct(updatedProduct);
    }
  };

  // handleEditProduct 함수 수정
  const handleEditProduct = (product: Product) => {
    setEditingProduct({ ...product });
  };

  // 수정 완료 핸들러 함수 추가
  const handleEditComplete = () => {
    if (editingProduct) {
      updateProduct(editingProduct);
      setEditingProduct(null);
    }
  };

  const contextValue = {
    editingProduct,
    setEditingProduct,
    handleProductNameUpdate,
    handleEditProduct,
    handleEditComplete
  };

  return (
    <EditingProductContext.Provider value={contextValue}>
      {children}
    </EditingProductContext.Provider>
  );
};

export const useEditingProductContext = () => {
  const context = useContext(EditingProductContext);
  if (!context)
    throw new Error(
      'useEditingProductContext must be used within a EditingProductProvider'
    );

  return context;
};
