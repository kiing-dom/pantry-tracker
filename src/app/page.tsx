"use client"

import React, { useEffect, useState } from 'react';
import { collection, addDoc, deleteDoc, query, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../firebaseConfig';

type Item = {
  id: string,
  name: string,
  quantity: string | number
}



export default function Home() {
  const [items, setItems] = useState<Item[]>([

  ]);
  const [newItem, setNewItem] = useState<{ name: string, quantity: string }>({ name: '', quantity: '' })
  
  const [total, setTotal] = useState(0);
  
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
    }
  }

  // delete items from database
  const deleteItem = async (id: string) => {
    await deleteDoc(doc(db, 'items', id));
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-3xl text-center">Pantry Tracker</h1>
        <div className="bg-neutral-400 p-4 rounded-lg">
          <form className="grid grid-cols-4 items-center text-black">
            <input
              className="col-span-2 p-3 border rounded-lg drop-shadow-lg"
              type="text"
              placeholder="Enter Item"
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />

            <input
              className="col-span-1 p-3 border rounded-lg mx-3 drop-shadow-lg"
              type="number"
              placeholder="Enter Quantity"
              value={newItem.quantity}
              onChange={(e) => setNewItem({ ...newItem, quantity: e.target.value })}
            />

            <button
              className="bg-slate-700 rounded-md drop-shadow-lg hover:scale-110 hover:bg-slate-400 transition-transform w-24 h-12 text-2xl"
              type="submit"
              onClick={addItem}
            >
              +
            </button>
          </form>

          <ul>
            {items.map((item, id) => (
              <li key={id} className='my-4 w-full flex justify-between bg-slate-700 rounded-lg drop-shadow-sm'>
                <div className='p-4 w-full flex justify-between'>
                  <span className='capitalize'>{item.name}</span>
                  <span className='text-yellow-300'>x{item.quantity}</span>
                </div>
                <button onClick={() => deleteItem(item.id)} className='ml-8 p-4 border-l-2 border-slate-900 hover:bg-slate-900'>X</button>
              </li>
            ))}
          </ul>
          {items.length < 1 ? ('') : (
            <div className='flex justify-end'>
              <span>Total: </span>
              <span>{total}</span>
            </div>
          )}

        </div>

      </div>
    </main>
  );
}
