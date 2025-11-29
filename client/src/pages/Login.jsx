import { useState }from 'react';
import { useNavigate, Link} from "react-router-dom";
import api from '../utils/axiosInstance';
import {useForm} from 'react-hook-form';

const Login = () => {
  const navigate = useNavigate();
  const [serverMsg, setServerMsg] = useState("");

  const {
    register, 
    handleSubmit,
    formState:{errors
      
      
      , isSubmitting},
  } = useForm()

  const onSubmit = async(data) =>{
    setServerMsg("");

    try{
      const res = await api.post('/auth/login',data);

      localStorage.setItem('token',res.data.accessToken);
      localStorage.setItem('refreshToken',res.data.refreshToken);

      navigate('/dashboard');
    }catch(err){
      setServerMsg(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className='p-6 mx-w-sm mx-auto'>
      <h1 className="text-2xl font-bold mb-4">Login</h1>

      {serverMsg && (
        <p className="text-rose-500 mb-2">{serverMsg}</p>
      )}
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">

        <div>
          <input type="email" placeholder='Email' className="border p-2 w-full"
          {...register('email',{
            required: "Email is required",
          })} 
          />
          {errors.email && (
            <p className="text-rose-500  text-sm">{errors.email.messages}</p>
          )}
        </div>

           <div>
          <input
            type="password"
            placeholder="Password"
            className="border p-2 w-full"
            {...register("password", {
              required: "Password is required",
            })}
          />
          {errors.password && (
            <p className="text-red-500 text-sm">{errors.password.message}</p>
          )}
        </div>
        
        <button className="bg-stone-600 text-white p-2 rounded mt-2 disabled:bg-stone-300"
        disabled={isSubmitting}
        >
          {isSubmitting?"Logging in..." : "Login"}
        </button>
      </form>
      <div className="mt-4 flex flex-col gap-1">
        <Link to='/signup' className="text-rose-700 underline">Create Accound</Link>
        <Link to='/forget' className="text-rose-700 underline">Forget Password?</Link>
      </div>
    </div>
  )
}

export default Login
