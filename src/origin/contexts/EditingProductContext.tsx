import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext
} from 'react';
import { Product } from '../../types.ts';
import { useEditProduct } from '../hooks/useEditProduct.ts';

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
  const {
    editingProduct,
    setEditingProduct,
    handleProductNameUpdate,
    handleEditProduct,
    handleEditComplete
  } = useEditProduct();

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
