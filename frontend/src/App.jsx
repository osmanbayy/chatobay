import React, { useEffect } from "react";
import { Navigate, Route, Routes } from "react-router";
import ChatPage from "./pages/ChatPage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from "./store/useAuthStore";
import PageLoader from "./components/PageLoader";
import { Toaster } from "react-hot-toast";

const App = () => {
  const { checkAuth, isCheckingAuth, authUser } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  console.log({authUser});

  if(isCheckingAuth) return <PageLoader />
  
  return (
    <div className="relative flex items-center justify-center min-h-screen p-4 overflow-hidden bg-zinc-950">
      {/* DECORATORS - GRID BG & GLOW SHAPES */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:14px_24px]" />
      <div className="absolute top-0 -left-4 size-96 bg-blue-500 opacity-20 blur-[100px]" />
      <div className="absolute bottom-0 -right-4 size-96 bg-blue-500 opacity-20 blur-[100px]" />
      {/* Routes */}
      <Routes>
        <Route
          path="/"
          element={authUser ? <ChatPage /> : <Navigate to={"/login"} />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignupPage /> : <Navigate to={"/"} />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to={"/"} />}
        />
      </Routes>

      <Toaster />
    </div>
  );
};

export default App;
