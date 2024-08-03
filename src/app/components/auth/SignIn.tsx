import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "../../../../firebaseConfig";
import { Button } from "@mui/material";
import { Google } from "@mui/icons-material";

const SignIn = () => {
    const provider = new GoogleAuthProvider();

    const handleSignIn = async () => {
        try {
            await signInWithPopup(auth, provider);
        } catch (error) {
            console.error('Error signing in', error);
        }
    };

    return (
        <Button
            className="hover:scale-110 transition-transform"
            variant="contained"
            startIcon={<Google />}
            onClick={handleSignIn}
            sx={{
                backgroundColor: "black",
                '&:hover': {
                  backgroundColor: '#778899',
                },
              }}
        >
            Sign in with Google
        </Button>
    );
};

export default SignIn;