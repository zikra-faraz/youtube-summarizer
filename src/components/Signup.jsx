import React, { useState } from "react";
import { useSignInEmailPassword, useSignUpEmailPassword } from "@nhost/react";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, User } from "lucide-react";
import toast from "react-hot-toast";
const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(true);
  const {
    signInEmailPassword,
    isLoading: isSigningIn,
    // isSuccess: isSignInSuccess,
    error: signInError,
  } = useSignInEmailPassword();
  const {
    signUpEmailPassword,
    isLoading: isSigningUp,
    // isSuccess: isSignUpSuccess,
    error: signUpError,
  } = useSignUpEmailPassword();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // console.log(isSignUp);

      if (isSignUp) {
        const response = await signUpEmailPassword(email, password);
        // console.log(response);

        if (response.isSuccess) {
          toast.success("SignUp Successfull");
          setEmail("");
          setPassword("");
          navigate("/", { replace: true });
        } else {
          console.error("Sign-up error:", response.isError);
          alert(
            "Sign-up failed: " + response.isError?.message || "signup error"
          ); // Inform the user.
        }
        // console.log(isSignup);
      } else {
        const response = await signInEmailPassword(email, password);
        // console.log(response);
        if (response.isSuccess) {
          toast.success("SignIn Successfull");
          setEmail("");
          setPassword("");
          navigate("/", { replace: true });
        } else {
          console.error("Sign-in  error:", response.isError);
          alert(
            "Sign-in  failed: " + response.isError?.message || "signin error"
          ); // Inform the user.
        }
        // if (isSuccess) {
        //   navigate("/", { replace: true });
        // }
      }
    } catch (error) {
      console.log(error);
      toast.error("something went wrong");
    } finally {
      setEmail("");
      setPassword("");
    }
  };

  return (
    <>
      {" "}
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 ">
        <nav className="bg-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <img src="./video-camera.png" alt="" width={26} />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  Video Summarizer
                </span>
              </div>
            </div>
          </div>
        </nav>
        <div className="flex justify-center h-[85vh] items-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-gray-600 mt-2">
                {isSignUp
                  ? "Sign up to get started"
                  : "Sign in to access your account"}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-4 focus:border-transparent bg-gray-200"
                  placeholder="Email address"
                  reuired
                />
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent"
                  placeholder="Password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSigningIn || isSigningUp}
                className="w-full bg-cyan-700 text-white py-2 px-4 rounded-lg hover:bg-cyan-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
              >
                {isSigningIn || isSigningUp
                  ? "Loading..."
                  : isSignUp
                  ? "Sign Up"
                  : "Sign In"}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                {isSignUp ? (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="font-medium text-cyan-900 hover:text-cyan-600"
                    >
                      Sign in
                    </button>
                  </>
                ) : (
                  <>
                    Don't have an account?{" "}
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="font-medium text-cyan-900 hover:text-cyan-600"
                    >
                      Sign up
                    </button>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Signup;
