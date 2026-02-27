"use client"; 
 
 import { useState } from "react"; 
 import { useRouter } from "next/navigation"; 
 import { getSupabaseBrowser } from "@/lib/supabase-browser"; 
 import { Eye, EyeOff, ShieldCheck } from "lucide-react"; 
 
 export default function UpdatePasswordPage() { 
   const [password, setPassword] = useState(""); 
   const [confirmPassword, setConfirmPassword] = useState(""); 
   const [showPwd, setShowPwd] = useState(false); 
   const [loading, setLoading] = useState(false); 
   const router = useRouter(); 
   const supabase = getSupabaseBrowser(); 
 
   const handleUpdate = async (e: React.FormEvent) => { 
     e.preventDefault(); 
     if (password !== confirmPassword) return alert("Mật khẩu xác nhận không khớp!"); 
     
     setLoading(true); 
     const { error } = await supabase.auth.updateUser({ password }); 
 
     if (error) { 
       alert(error.message); 
     } else { 
       alert("Cập nhật mật mã thành công! Đang tiến vào Dashboard..."); 
       router.push("/dashboard"); 
     } 
     setLoading(false); 
   }; 
 
   return ( 
     <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6"> 
       <div className="w-full max-w-[400px] bg-zinc-950 p-8 rounded-2xl border border-zinc-900 shadow-2xl"> 
         <h1 className="text-2xl font-bold text-center mb-6">Khôi Phục Mật Khẩu Mới</h1> 
         <form onSubmit={handleUpdate} className="space-y-4"> 
           <div className="relative"> 
             <input 
               type={showPwd ? "text" : "password"} 
               placeholder="Mật khẩu mới..." 
               className="w-full p-4 bg-zinc-900 rounded-xl outline-none focus:ring-1 ring-white" 
               value={password} 
               onChange={(e) => setPassword(e.target.value)} 
               required 
             /> 
             <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-4 text-zinc-500"> 
               {showPwd ? <EyeOff size={20} /> : <Eye size={20} />} 
             </button> 
           </div> 
           <input 
             type="password" 
             placeholder="Xác nhận mật khẩu mới..." 
             className="w-full p-4 bg-zinc-900 rounded-xl outline-none focus:ring-1 ring-white" 
             value={confirmPassword} 
             onChange={(e) => setConfirmPassword(e.target.value)} 
             required 
           /> 
           <button 
             disabled={loading} 
             className="w-full p-4 bg-white text-black font-bold rounded-xl active:scale-95 transition-all" 
           > 
             {loading ? "Đang định hình..." : "Xác nhận & Vào App"} 
           </button> 
         </form> 
       </div> 
     </div> 
   ); 
 }
