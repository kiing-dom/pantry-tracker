"use client";

import React, { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, query, onSnapshot, doc, updateDoc, writeBatch, where } from 'firebase/firestore';
import { db, storage } from '../../../firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, List, ListItem, IconButton, ListItemText, ListItemSecondaryAction, InputAdornment, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Delete, Edit, Save, Search, DeleteForever, ArrowDownward, Cancel } from '@mui/icons-material';
import { Montserrat } from 'next/font/google';
import { useAuth } from '../context/AuthContext';
import '@/stylesheets/pantrytracker.css';
import '@/stylesheets/expirydates.css';

const mont = Montserrat({
  subsets: ["latin"],
  weight: "700",
});

const mont_light = Montserrat({
  subsets: ["latin"],
  weight: "400",
});

type Item = {
  id: string;
  name: string;
  quantity: string | number;
  imageUrl?: string | null;
  expiryDate?: string;
}

export default function Pantry() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<{ name: string; quantity: string; expiryDate: string }>({ name: '', quantity: '', expiryDate: '' });
  const [total, setTotal] = useState(0);
  const [editItem, setEditItem] = useState<{ name: string; quantity: string; expiryDate: string }>({ name: '', quantity: '', expiryDate: '' });
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const fetchItems = async () => {
      const q = query(collection(db, 'items'), where('userId', '==', user.uid));
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const itemsArray: Item[] = [];
        querySnapshot.forEach((doc) => {
          itemsArray.push({ ...doc.data(), id: doc.id } as Item);
        });
        setItems(itemsArray);
        const totalQuantity = itemsArray.reduce((acc, item) => acc + Number(item.quantity), 0);
        setTotal(totalQuantity);
      });
      return unsubscribe;
    };

    fetchItems().catch(console.error);
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const imageRef = ref(storage, `images/${file.name}`);
    await uploadBytes(imageRef, file);
    return await getDownloadURL(imageRef);
  };

  const addItem = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (newItem.name !== '' && newItem.quantity !== '' && user) {
      let imageUrl: string | undefined;
      if (imageFile) {
        imageUrl = await uploadImage(imageFile);
      }
      const newItemData: any = {
        name: newItem.name.trim(),
        quantity: newItem.quantity,
        userId: user.uid,
        expiryDate: newItem.expiryDate ? newItem.expiryDate : undefined
      };

      if (imageUrl) {
        newItemData.imageUrl = imageUrl;
      }

      await addDoc(collection(db, 'items'), newItemData);
      setNewItem({ name: '', quantity: '', expiryDate: '' });
      setImageFile(null);
      setImagePreview(null);
      setIsModalOpen(false);
    }
  };

  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'items', id));
  };

  const clearAllItems = async () => {
    const batch = writeBatch(db);
    items.forEach(item => {
      const itemRef = doc(db, 'items', item.id);
      batch.delete(itemRef);
    });
    await batch.commit();
    setIsClearDialogOpen(false);
  };

  const handleEditItem = (item: Item) => {
    setEditItemId(item.id);
    setEditItem({ name: item.name, quantity: item.quantity.toString(), expiryDate: item.expiryDate ?? '' });
  };

  const saveEditItem = async (id: string) => {
    await updateDoc(doc(db, 'items', id), {
      name: editItem.name.trim(),
      quantity: Number(editItem.quantity),
      expiryDate: editItem.expiryDate
    });
    setEditItemId(null);
    setEditItem({ name: '', quantity: '', expiryDate: '' });
  };

  const getExpiryStatus = (expiryDate: string) => {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const difference = expiry.getTime() - today.getTime();
    const days = Math.ceil(difference / (1000 * 3600 * 24));

    if (days <= 0) {
      return 'expired';
    }
    if (days <= 7) {
      return 'soon';
    }
    return 'ok';
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='bg-[#F8F8FF] flex flex-col items-center min-h-[84vh] p-12'>
      <h1 style={mont.style} className='pantry-tracker-title text-xl text-center mb-6 sm:text-xl md:3xl lg:text-5xl bg-black rounded-md p-4'>
        <ArrowDownward />
        Track Your Items
        <ArrowDownward />
      </h1>
      <div className="expiry-key flex justify-center items-center mb-4 bg-neutral-800 bg-opacity-80 p-4 rounded-lg">
        <div className="flex items-center mr-4">
          <div className="key-color bg-green-500 w-4 h-4 mr-1 rounded"></div>
          <span style={mont_light.style}>Okay</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="key-color bg-orange-500 w-4 h-4 mr-1 rounded"></div>
          <span style={mont_light.style}>Close to Expiry</span>
        </div>
        <div className="flex items-center">
          <div className="key-color bg-red-500 w-4 h-4 mr-1 rounded"></div>
          <span style={mont_light.style}>Expired</span>
        </div>
      </div>
      <Container className='bg-neutral-500 w-[70%] rounded-lg drop-shadow-md outline-2 outline-double outline-black p-6'>
        <div className='flex flex-col items-center mt-4'>
          <TextField
            label="Search Items"
            variant="outlined"
            fullWidth
            margin="dense"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search className='text-white' />
                </InputAdornment>
              ),
            }}
            sx={{
              '.MuiInputBase-input': {
                color: 'white',
                backgroundColor: '#333',
                outline: 'none',
              },
              '& .MuiFormLabel-root': {
                color: 'white',
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: 'white',
              },
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#333',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                  borderWidth: '1px',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: '#333',
                },
                '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'white',
                },
              },
              '& input:focus': {
                outline: 'none',
              },
              '&::before': {
                outline: 'none',
              },
              '&::after': {
                outline: 'none',
              },
            }}
          />
          <div className='flex gap-2 mt-4'>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
              sx={{
                backgroundColor: 'black',
                '&:hover': {
                  backgroundColor: 'slategrey'
                }
              }}
            >
              Add New Item
            </Button>
            <Button
              variant='contained'
              startIcon={<DeleteForever />}
              onClick={() => setIsClearDialogOpen(true)}
              sx={{
                backgroundColor: 'red',
                '&:hover': {
                  backgroundColor: 'slategrey'
                }
              }}
            >
              Clear All Items
            </Button>
          </div>
        </div>

        <Dialog open={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <DialogTitle>Add New Item</DialogTitle>
          <DialogContent>
            <TextField
              label="Enter Item"
              variant='outlined'
              fullWidth
              margin='dense'
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
            <TextField
              label="Enter Quantity"
              variant="outlined"
              fullWidth
              margin="dense"
              type='number'
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />
            <TextField
              label="Expiry Date"
              variant="outlined"
              fullWidth
              margin="dense"
              type='date'
              InputLabelProps={{ shrink: true }}
              value={newItem.expiryDate}
              onChange={(e) => setNewItem({ ...newItem, expiryDate: e.target.value })}
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ marginTop: '16px' }}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" style={{ marginTop: '16px', width: '100px', height: '100px' }} />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)} className='text-red-500'>Cancel</Button>
            <Button onClick={addItem} className='text-purple-500'>Add Item</Button>
          </DialogActions>
        </Dialog>

        <Dialog open={isClearDialogOpen} onClose={() => setIsClearDialogOpen(false)}>
          <DialogTitle>Clear All Items</DialogTitle>
          <DialogContent>
            Are you sure you want to clear all items from your pantry?
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsClearDialogOpen(false)} className='text-red-500'>Cancel</Button>
            <Button onClick={clearAllItems} className='text-purple-500'>Clear All</Button>
          </DialogActions>
        </Dialog>

        <List>
          {filteredItems.map((item, index) => (
            <React.Fragment key={item.id}>
              <ListItem className='flex items-center justify-between p-2'>
                {editItemId === item.id ? (
                  <div className='flex justify-center items-center gap-2 w-full'>
                    <TextField
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      variant='outlined'
                      label='Item Name'
                    />
                    <TextField
                      value={editItem.quantity}
                      onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
                      variant='outlined'
                      type='number'
                      label='Quantity'
                    />
                    <TextField
                      value={editItem.expiryDate}
                      onChange={(e) => setEditItem({ ...editItem, expiryDate: e.target.value })}
                      variant='outlined'
                      type='date'
                      InputLabelProps={{ shrink: true }}
                      label='Expiry Date'
                    />
                    <IconButton edge="end" onClick={() => saveEditItem(item.id)}>
                      <Save className='text-white m-2 hover:scale-110 transition-transform' />
                    </IconButton>
                    <IconButton edge="end" onClick={() => setEditItemId(null)}>
                      <Cancel className='text-white m-2 hover:scale-110 transition-transform' />
                    </IconButton>
                  </div>
                ) : (
                  <>
                    <ListItemText
                      className='capitalize'
                      primary={item.name}
                      secondary={`Quantity: ${item.quantity}`}
                      primaryTypographyProps={{ style: mont.style, fontWeight: "bold", fontSize: "20px" }}
                      secondaryTypographyProps={{ style: mont_light.style, color: "white" }}
                    />
                    {item.imageUrl && (
                      <img src={item.imageUrl} alt={item.name} style={{ width: '50px', height: '50px', borderRadius: '5px' }} />
                    )}
                    {item.expiryDate && (
                      <div style={mont_light.style} className={`expiry-date ${getExpiryStatus(item.expiryDate)} flex-1`}>
                        Expiry Date: {new Date(item.expiryDate).toLocaleDateString()}
                      </div>
                    )}
                    <ListItemSecondaryAction>
                      <IconButton edge="end" onClick={() => handleEditItem(item)}>
                        <Edit className='text-white m-2 hover:scale-110 transition-transform' />
                      </IconButton>
                      <IconButton edge="end" onClick={() => deleteItem(item.id)}>
                        <Delete className='text-white m-2 drop-shadow-md hover:scale-110 transition-transform' />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </>
                )}
              </ListItem>
              {index < filteredItems.length - 1 && <Divider className='bg-white' />}
            </React.Fragment>
          ))}
        </List>
        {items.length > 0 && (
          <div className='flex justify-end mt-4'>
            <span>Total: {total}</span>
          </div>
        )}
      </Container>
    </div>
  );
}
