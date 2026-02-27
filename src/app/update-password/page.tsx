"use client"; 
 
 import { useState } from "react"; 
 import { useRouter } from "next/navigation"; 
 import { getSupabaseBrowser } from "@/lib/supabase-browser"; 
 
 export default function UpdatePasswordPage() { 
   const [password, setPassword] = useState(""); 
   const [message, setMessage] = useState(""); 
   const [isProcessing, setIsProcessing] = useState(false); 
   const router = useRouter(); 
   const supabase = getSupabaseBrowser(); 
 
   const handleUpdate = async (e: React.FormEvent) => { 
     e.preventDefault(); 
     setIsProcessing(true); 
     setMessage(""); 
 
     // Supabase tự động nhận diện user từ link trong email 
     const { error } = await supabase.auth.updateUser({ password }); 
 
     if (error) { 
       setMessage("Lỗi: " + error.message); 
       setIsProcessing(false); 
     } else { 
       setMessage("Đã rèn lại chìa khóa thành công! Khai thông hệ thống..."); 
       setTimeout(() => router.push("/dashboard"), 2000); 
     } 
   }; 
 
   return ( 
     <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4"> 
       <div className="bg-[#111] border border-zinc-800 p-8 rounded-2xl w-full max-w-md"> 
         <div className="text-center mb-8"> 
           <h1 className="text-2xl font-bold text-white mb-2">Định Hình Lại</h1> 
           <p className="text-zinc-400 text-sm"> 
             Tạo mật khẩu mới để tiếp tục hành trình sáng tạo tại Ý Lâm 
           </p> 
         </div> 
         <form onSubmit={handleUpdate} className="flex flex-col gap-4"> 
           <input 
             type="password" 
             placeholder="Mật khẩu mới (ít nhất 6 ký tự)" 
             className="bg-black border border-zinc-800 text-white rounded-lg p-3 outline-none focus:border-white transition-colors" 
             value={password} 
             onChange={(e) => setPassword(e.target.value)} 
             required 
           /> 
           <button 
             type="submit" 
             disabled={isProcessing} 
             className="bg-white text-black font-bold rounded-lg p-3 hover:bg-zinc-200 transition-colors disabled:opacity-50" 
           > 
             {isProcessing ? "Đang xử lý..." : "Xác nhận & Đăng nhập"} 
           </button> 
         </form> 
         {message && ( 
           <p className="mt-4 text-center text-sm text-zinc-400">{message}</p> 
         )} 
       </div> 
     </div> 
   ); 
 }
