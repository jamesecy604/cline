   // next-ai-gateway/app/signin/page.tsx
   "use client";

   import { signIn } from "next-auth/react";

   const SignInPage = () => {
     return (
       <div>
         <h1>Sign In</h1>
         <button onClick={() => signIn("github")}>Sign in with GitHub</button>
         <button onClick={() => signIn("google")}>Sign in with Google</button>
       </div>
     );
   };

   export default SignInPage;