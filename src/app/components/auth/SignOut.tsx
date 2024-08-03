import React, { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../../../firebaseConfig';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';

const SignOut: React.FC = () => {
    const [open, setOpen] = useState(false); // State to manage dialog visibility

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            handleClose(); // Close dialog after successful sign-out
        } catch (error) {
            console.error('Error signing out', error);
        }
    };

    return (
        <div>
            <Button
                className="hover:scale-110 transition-transform"
                variant="contained"
                color="secondary"
                onClick={handleClickOpen}
            >
                Sign Out
            </Button>

            <Dialog
                open={open}
                onClose={handleClose}
                aria-labelledby="sign-out-dialog-title"
                aria-describedby="sign-out-dialog-description"
            >
                <DialogTitle id="sign-out-dialog-title">Confirm Sign Out</DialogTitle>
                <DialogContent>
                    <Typography id="sign-out-dialog-description">
                        Are you sure you want to sign out?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSignOut} color="secondary">
                        Sign Out
                    </Button>
                </DialogActions>
            </Dialog>
        </div>
    );
};

export default SignOut;
