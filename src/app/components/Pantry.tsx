"use client";

import React, { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, query, onSnapshot, doc, updateDoc, writeBatch, where } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, List, ListItem, IconButton, ListItemText, ListItemSecondaryAction, InputAdornment, Divider } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Delete, Edit, Save, Search, DeleteForever } from '@mui/icons-material';
import { Montserrat } from 'next/font/google';
import { useAuth } from '../context/AuthContext';
import '@/stylesheets/pantrytracker.css';

const mont = Montserrat({
  subsets: ["latin"],
  weight: "700",
});

type Item = {
  id: string,
  name: string,
  quantity: string | number
}

export default function Pantry() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<{ name: string, quantity: string }>({ name: '', quantity: '' });
  const [total, setTotal] = useState(0);
  const [editItem, setEditItem] = useState<{ name: string; quantity: string }>({ name: '', quantity: '' });
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

  const { user } = useAuth(); // Get the current user

  // Read items from database
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

  // Add items to database
  const addItem = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (newItem.name !== '' && newItem.quantity !== '' && user) {
      await addDoc(collection(db, 'items'), {
        name: newItem.name.trim(),
        quantity: newItem.quantity,
        userId: user.uid // Add userId to the item
      });
      setNewItem({ name: '', quantity: '' });
      setIsModalOpen(false);
    }
  };

  // Delete items from database
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'items', id));
  };

  // Clear all items from database
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
    setEditItem({ name: item.name, quantity: item.quantity.toString() });
  };

  const saveEditItem = async (id: string) => {
    await updateDoc(doc(db, 'items', id), {
      name: editItem.name.trim(),
      quantity: Number(editItem.quantity)
    });
    setEditItemId(null);
    setEditItem({ name: '', quantity: '' });
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='bg-[#F8F8FF] flex flex-col items-center min-h-[100vh] p-12'>
      <h1 style={mont.style} className='pantry-tracker-title text-5xl text-center mb-6 sm:text-3xl md:4xl lg:text-5xl'>Pantry Tracker 🍰</h1>
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
              },
              '& .MuiFormLabel-root': {
                color: 'white',
              },
              '& .MuiFormLabel-root.Mui-focused': {
                color: 'white'
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: 'white',
                },
                '&:hover fieldset': {
                  borderColor: 'white',
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'white',
                }
              },
            }}
          />

          <div className='flex gap-2 mt-4'>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => setIsModalOpen(true)}
              sx={{
                backgroundColor: '#9362FF',
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

        {/* Add New Item Dialog */}
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setIsModalOpen(false)} className='text-red-500'>Cancel</Button>
            <Button onClick={addItem} className='text-purple-500'>Add Item</Button>
          </DialogActions>
        </Dialog>

        {/* Clear All Items Confirmation Dialog */}
        <Dialog open={isClearDialogOpen} onClose={() => setIsClearDialogOpen(false)}>
          <DialogTitle>Clear All Items</DialogTitle>
          <DialogContent>
            <p>Are you sure you want to delete all items from the pantry?</p>
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
                      label="Item Name"
                      variant='outlined'
                      value={editItem.name}
                      onChange={(e) => setEditItem({ ...editItem, name: e.target.value })}
                      sx={{
                        '.MuiInputBase-input': {
                          color: 'white',
                        },
                        '& .MuiFormLabel-root': {
                          color: 'white',
                        },
                        '& .MuiFormLabel-root.Mui-focused': {
                          color: 'white',
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'white',
                          },
                          '&:hover fieldset': {
                            borderColor: 'white',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'white',
                          }
                        },
                      }}
                    />
                    <TextField
                      label="Quantity"
                      variant='outlined'
                      value={editItem.quantity}
                      onChange={(e) => setEditItem({ ...editItem, quantity: e.target.value })}
                      sx={{
                        '.MuiInputBase-input': {
                          color: 'white',
                        },
                        '& .MuiFormLabel-root': {
                          color: 'white',
                        },
                        '& .MuiFormLabel-root.Mui-focused': {
                          color: 'white',
                        },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': {
                            borderColor: 'white',
                          },
                          '&:hover fieldset': {
                            borderColor: 'white',
                          },
                          '&.Mui-focused fieldset': {
                            borderColor: 'white',
                          }
                        },
                      }}
                    />
                    <IconButton onClick={() => saveEditItem(item.id)}>
                      <Save className='text-white drop-shadow-md hover:scale-110 transition-transform' />
                    </IconButton>
                  </div>
                ) : (
                  <>
                    <ListItemText className='capitalize' primary={item.name} secondary={`Quantity: ${item.quantity}`} primaryTypographyProps={{ fontWeight: "bold", fontSize: "20px" }} secondaryTypographyProps={{ color: "white" }} />
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
