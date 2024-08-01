"use client"

import React, { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, query, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Button, Container, Dialog, DialogActions, DialogContent, DialogTitle, TextField, List, ListItem, IconButton, ListItemText, ListItemSecondaryAction } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { Delete, Edit, Save } from '@mui/icons-material';

type Item = {
  id: string,
  name: string,
  quantity: string | number
}



export default function Home() {
  const [items, setItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<{ name: string, quantity: string }>({ name: '', quantity: '' })
  const [total, setTotal] = useState(0);
  const [editItem, setEditItem] = useState<{ name: string; quantity: string }>({ name: '', quantity: '' })
  const [editItemId, setEditItemId] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  // read items from database
  useEffect(() => {
    const fetchItems = async () => {
      const q = query(collection(db, 'items'));
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
  }, []);


  // add items to database
  const addItem = async (ev: React.FormEvent) => {
    ev.preventDefault()
    if (newItem.name !== '' && newItem.quantity !== '') {
      // setItems([...items, newItem]);

      await addDoc(collection(db, 'items',), {
        name: newItem.name.trim(),
        quantity: newItem.quantity
      })
      setNewItem({ name: '', quantity: '' });
      setIsModalOpen(false)
    }
  }

  // delete items from database
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'items', id));
  }

  const handleEditItem = (item: Item) => {
    setEditItemId(item.id);
    setEditItem({ name: item.name, quantity: item.quantity.toString() })
  };

  const saveEditItem = async (id: string) => {
    await updateDoc(doc(db, 'items', id), {
      name: editItem.name.trim(),
      quantity: Number(editItem.quantity)
    });
    setEditItemId(null);
    setEditItem({ name: '', quantity: '' })
  };

  const filteredItems = items.filter(item =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className='flex justify-center items-center min-h-[84vh] p-12'>
      <Container className='bg-neutral-500 w-[70%] rounded-lg'>
        <div className='flex flex-col items-center mt-4'>
          <Button
            className='bg-purple-500 hover:bg-slate-500'
            variant='contained'
            startIcon={<AddIcon />}
            onClick={() => setIsModalOpen(true)}
          >
            Add New Item
          </Button>
        </div>

        <h1 className='text-2xl text-center'>Pantry Tracker</h1>

        <TextField
          label="Search Items"
          variant="outlined"
          fullWidth
          margin="dense"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
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

        <Dialog
          open={isModalOpen} onClose={() => setIsModalOpen(false)}
        >
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
            <Button onClick={addItem} className='text-purple-500' >Add Item</Button>
          </DialogActions>
        </Dialog>

        <List>
          {filteredItems.map((item) => (
            <ListItem className='flex items-center justify-between p-2' key={item.id}>
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
