import { signOut } from "firebase/auth"
import { auth } from "../../../../firebaseConfig"
import { Button } from "@mui/material";

const SignOut = () => {
    const handleSignOut = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error signing out', error);
        }
    };

    return (
        <Button
            className="hover:scale-110 transition-transform"
            variant="contained"
            color="secondary"
            onClick={handleSignOut}
        >
            Sign Out
        </Button>
    );
};

export default SignOut;